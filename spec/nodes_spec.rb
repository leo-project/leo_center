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
