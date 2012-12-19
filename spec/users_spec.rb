require_relative "spec_helper"

describe LeoTamer do
  describe "/users/list.json" do
    let(:url) { "/users/list.json" }
    subject { get_json url }
    it { should be_a Hash }

    its(["data"]) do
      should be_a Array 
      subject.each do |users|
        users.should include(
          "user_id", "role", "access_key_id", "created_at"
        )
      end
    end
  end

  describe "/users/add_user" do
    let(:url) { "/users/add_user" }

    context "with no params" do
      subject { post url }
      its(:status) { should == 500 }
    end

    context "with a param: 'user_id'" do
      subject { post url, user_id: "foo" }
      its(:status) { should == 500 }
    end
  end

  describe "/users/delete_user" do
    let(:url) { "/users/delete_user" }
    # TODO
  end

  describe "/users/update_user" do
    let(:url) { "/users/update_user" }

    context "with no params" do
      subject { post url }
      its(:status) { should == 500 }
    end

    context "with no sessin id" do
      subject { post url, user_id: "foo" }
      its(:status) { should == 500 }
    end
  end
end
