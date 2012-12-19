require_relative "spec_helper"

describe LeoTamer do
  describe "/endpoints/list.json" do
    subject { get_json "/endpoints/list.json" }
    it { should be_a Hash }
    its(["data"]) do
      should be_a Array
      subject.each do |endpoint|
        endpoint.should include("endpoint", "created_at")
      end
    end
  end

  describe "/endpoints/add_endpoint" do
    let(:url) { "/endpoints/add_endpoint" }

    context "with no params" do
      subject { post  url }
      its(:status) { should == 500 }
    end

    context "with a params: 'endpoint'" do
      subject { post url, endpoint: "localhost" }
      its(:status) { should == 200 }
    end
  end

  describe "/endpoints/delete_endpoint" do
    let(:url) { "/endpoints/delete_endpoint" }

    context "with no params" do
      # TODO
    end
  end
end
