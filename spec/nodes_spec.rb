require_relative "spec_helper"

describe LeoTamer do
  describe "/nodes/list.json" do
    subject { get_json "/nodes/list.json" }

    it { should be_a Hash }

    its(["data"]) do
      should be_a Array
      subject.each do |node|
        node.should include("name")
      end
    end
  end
  
  describe "/nodes/status.json" do
    subject { get_json "/nodes/status.json" }
    
    it { should be_a Hash }

    its(["data"]) do
      should be_a Array
      subject.each do |node|
        node.should include(
          "type",
          "node",
          "status",
          "ring_hash_current",
          "ring_hash_previous",
          "joined_at"
        )
      end
    end
  end

  describe "/nodes/detail.json" do
    context "with no params" do
      subject { get "/nodes/detail.json" }
      its(:status) { should == 500 }
    end
  end

  describe "/nodes/execute" do
    context "with no params" do
      subject do
        post "/nodes/execute"
        last_response
      end

      its(:status) { should == 500 }
    end
  end
end
