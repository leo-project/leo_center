ES_URI = "http://cloud.github.com/downloads/elasticsearch/elasticsearch/elasticsearch-0.19.9.tar.gz"
ES_ServiceWrapperURI = "https://github.com/elasticsearch/elasticsearch-servicewrapper.git"
ES_ServiceScript = "#{ES_Root}/bin/service/elasticsearch"

Logstash_URI = "http://semicomplete.com/files/logstash/logstash-1.1.1-monolithic.jar"

trap(:INT) { exit }

def run_with_retry_as_root(command)
  run command rescue run "#{sudo} #{command}"
end

def transfer_with_retry
  retry_count = 0
  begin
    timeout(TransferTimeout) do
      yield
    end
  rescue Interrupt
    if Capistrano::CLI.ui.agree("Do you want to retry? [y/n]:")
      retry
    end
  rescue Timeout::Error
    warn "Operation timed out. Retrying..."
    retry_count += 1
    retry if retry_count < TransferRetryTimes
  end
end

def open_uri_with_progress_bar(uri)
  pbar = nil
  progress_init = proc do |content_length|
    pbar = ProgressBar.new("Downloading", content_length)
    pbar.file_transfer_mode
  end
  progress = proc do |received_length|
    pbar.set(received_length)
  end
  open_uri_opts = { content_length_proc: progress_init, progress_proc: progress }
  transfer_with_retry do
    string_io = OpenURI.open_uri(uri, open_uri_opts)
  end
  pbar.finish
  string_io
end

def upload_with_progress_bar(io, file_path)
  retry_count = 0
  pbar = nil
  transfer_with_retry do
    upload(io, file_path, via: :scp) do |channel, name, sent, total|
      unless pbar # init ProgressBar
        pbar = ProgressBar.new("Uploading", total)
        pbar.file_transfer_mode
      end
      pbar.set(sent)
    end
  end
  pbar.finish
  nil
end

def uri_filename(uri)
  uri_path = URI.parse(uri).path
  File.basename(uri_path)
end

def get_and_transfer(title, uri, dest_path)
  file_name = uri_filename(uri)

  cache_path = "../etc/#{file_name}"
  if File.exist?(cache_path)
    puts "File is cached in #{File.expand_path(cache_path)}."
    io = File.open(cache_path)
  else
    run "mkdir -p #{dest_path}"
    puts "Download #{title}"
    io = open_uri_with_progress_bar(uri)
    IO.copy_stream(io, cache_path)
  end

  puts "Upload #{title}"
  upload_with_progress_bar(io, "#{dest_path}/#{file_name}")

  return file_name

  ensure
    io.close if io && !io.closed?
end

desc "bundle install (both CRuby and JRuby)"
task :bundle_install, :roles => :tamer do
  command = "bundle install --gemfile #{TamerRoot}/Gemfile"
  run_with_retry_as_root command
  run_with_retry_as_root "jruby -S #{command}"
end

desc "install libraries for LeoTamer (Debian)"
task :install_libs_for_tamer, :roles => :tamer do
  run "#{sudo} apt-get install -y git libssl-dev libzmq-dev uuid-dev libyaml-dev nodejs-dev libxml2-dev libxslt-dev"
  run_with_retry_as_root "gem install --conservative bundler"
  run_with_retry_as_root "jgem install --conservative jruby-openssl bundler"
  bundle_install
end

desc "install libraries for ElasticSearch & LogStash (Debian)"
task :install_libs_for_es_and_logstash, :roles => [:es, :logstash] do
  run "#{sudo} apt-get install -y git libzmq-dev uuid-dev"
end

desc "install ElasticSearch"
task :install_es, :roles => :es do
  install_libs_for_es_and_logstash
  es_tar = get_and_transfer("ElasticSearch", ES_URI, ES_Root)
  es_dir = File.basename(es_tar, ".tar.gz")
  service_wrapper = uri_filename(ES_ServiceWrapperURI)
  service_wrapper_dir = File.basename(service_wrapper, ".git")

  run <<-EOS 
  dir_extract()
  {
    if mv $1/* .; then
      rmdir $1;
    else
      cp -rvf $1/* .;
      rm -rvf $1;
    fi;
  };

  # Extract ElasticSearch
  cd #{ES_Root};
  tar -xzvf  #{es_tar};
  dir_extract #{es_dir};
  rm -v #{es_tar};

  # Extract ES-ServiceWrapper
  cd bin;
  git clone #{ES_ServiceWrapperURI};
  rm -rvf #{service_wrapper_dir}/.git;
  rm -v #{service_wrapper_dir}/.gitignore;
  dir_extract #{service_wrapper_dir};
  EOS
end

desc "install Logstash"
task :install_logstash, :roles => :logstash do
  install_libs_for_es_and_logstash
  get_and_transfer("Logstash", Logstash_URI, Logstash_Root)
  upload("../etc/logstash.conf", "#{Logstash_Root}/logstash.conf")
end

desc "start ElasticSearch"
task :start_es, :roles => :es do
  run "#{ES_ServiceScript} start"
end

desc "stop ElasticSearch"
task :stop_es, :roles => :es do
  run "#{ES_ServiceScript} stop"
end

desc "start Logstash"
task :start_logstash, :roles => :logstash do
  logstash_jar = uri_filename(Logstash_URI)
  run "nohup java -jar #{Logstash_Root}/#{logstash_jar} agent -f #{Logstash_Root}/logstash.conf & sleep 3"
end

desc "stop Logstash"
task :stop_logstash, :roles => :logstash do
  logstash_jar = uri_filename(Logstash_URI)
  run "pkill -f '#{Logstash_Root}/#{logstash_jar}.+#{Logstash_Root}/logstash.conf'" rescue nil
end

desc "gem update (both CRuby and JRuby)"
task :gem_update, :roles => :tamer do
  run_with_retry_as_root "gem update"
  run_with_retry_as_root "jgem update"
end

desc "start LeoTamer with WEBrick"
task :start_tamer, :roles => :tamer do
  run_with_retry_as_root "jruby #{TamerRoot}/config.ru"
end

desc "start LeoTamer with WEBrick (CRuby)"
task :start_tamer_c, :roles => :tamer do
  run_with_retry_as_root "ruby #{TamerRoot}/config.ru"
end

desc "install all libraries and softwares"
task :install do
  install_libs_for_tamer
  install_es
  install_logstash
  bundle_install
end

desc "start ElasticSearch, Logstash, LeoTamer"
task :start do
  stop_logstash
  stop_es

  start_es
  start_logstash
  start_tamer
end
