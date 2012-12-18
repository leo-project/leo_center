require_relative "spec_helper"
require_relative "../app"

def app
  LeoTamer.new
end

describe LeoTamer do
  describe "/nodes/list.json" do
    subject { get_json "/nodes/list.json" }

    it "returns valid format" do
      should be_a Hash
      should have_key "data"
      should have(1).items
      
      subject["data"].should be_a Array
      subject["data"].each do |node|
        node.should be_a Hash
        node.should have_key "name"
        node.should have(1).items
        node["name"].should be_a String
      end
    end
  end
  
  describe "/nodes/status.json" do
    Member = {
      type: String,
      node: String,
      status: String,
      ring_hash_current: String,
      ring_hash_previous: String,
      joined_at: String
    }
    
    subject { get_json "/nodes/status.json" }

    it "returns valid format" do
      should be_a Hash
      should have_key "data"
      should have(1).items
      
      data = subject["data"]
      data.should be_a Array
      
      data.each do |node|
        node.should be_a Hash
        Member.each do |key, klass|
          key = key.to_s
          node.should have_key key
          node[key].should be_a klass
        end
      end
    end
  end

  describe "/nodes/detail.json" do
    subject { get_json "/nodes/status.json" }
  end

  describe "/nodes/execute" do
    subject do
      post "/nodes/execute"
      last_response.status
    end

    it { should eql 500 }
  end
end
