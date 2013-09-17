#======================================================================
#
# LeoFS
#
# Copyright (c) 2012-2013 Rakuten, Inc.
#
# This file is provided to you under the Apache License,
# Version 2.0 (the "License"); you may not use this file
# except in compliance with the License.  You may obtain
# a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
#======================================================================
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
