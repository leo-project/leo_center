# LeoCenter

**Copyright (c) 2013-2014 Rakuten, Inc.**

**LeoCenter** is more powerful and user-friendly LeoFS's Web GUI Tool, the documentation of which is [here](http://leo-project.net/leofs/docs-1.4/leo_center/leo_center.html).


## Getting Started

### Requirements
* LeoFS v0.16.8 or higher
* Ruby 1.9.3 or higher

### Install

```
$ git clone
$ bundle install
```

### Configure

config.yml

```yaml
:managers:
  - "localhost:10020" # master
  - "localhost:10021" # slave
:credential:
  :access_key_id: "YOUR_ACCESS_KEY_ID"
  :secret_access_key: "YOUR_SECRET_ACCESS_KEY"
```

### Run on Thin Web Server

```
$ thin start -a ${HOST} -p ${PORT}
```

## Using Icons

* [Database](http://barrymieny.deviantart.com/art/Database-104013446): Barry Mieny (CC BY-NC-SA 3.0)
* [Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library): Tango project (Public Domain)
* [RRZE Icon Set](http://rrze-icon-set.berlios.de/): PRZE (CC BY-SA 3.0)
* [Fire Icon, Database, Refresh Icon](http://www.fatcow.com/): FatCow Web Hosting (CC BY 3.0 US)
