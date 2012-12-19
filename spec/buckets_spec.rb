require_relative "spec_helper"

describe LeoTamer do
  describe "/buckets/list.json" do
    subject { get_json "/buckets/list.json" }

    it { should be_a Hash }

    its(["data"]) do
      should be_a Array
      subject.each do |bucket|
        bucket.should be_a Hash
        bucket.should include("name", "owner", "created_at")
      end
    end
  end

  describe "/buckets/add_bucket" do
    context "with no params" do
      subject do
        post "/buckets/add_bucket"
        last_response
      end

      its(:status) { should == 500 }
    end

    context "without session id" do
      subject do
        post "/buckets/add_bucket", { bucket: "foo" }
        last_response
      end

      its(:status) { should == 500 }
    end
  end
end
