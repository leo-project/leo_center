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

describe LeoCenter do
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
