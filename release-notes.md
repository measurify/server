# Release Notes

## Version 0.5.0

2022.11.12

+ added support for timeseries
+ removed check on measurements with no samples

## Version 0.6.0

2022.11.16

+ added support to create custom roles for specific user behaviour
+ updated check of all entities operations based on new roles

## Version 0.6.1

2022.11.18

+ added range attribute for metadata and topic fields in experiments \[min,max\] for scalar
+ added enum type for experiments metadata and topic fields between values compiled in "range" attribute in protocol

## Version 0.6.2

2022.11.22

+ added csv upload and download for timeseries 

## Version 0.6.3

2022.11.25

+ Now separators of CSV file can be defined in the url of the request for POST and GET
+ Updated PostMan Collection

## Version 0.6.4

2023.02.01

+ Reset Password supported by email and reset page added into the gui
+ Add settings for check Password strength and validity days of password
+ Added field "select" in the query of get resources routes to receive only chosen fields
+ Experiment/id/group route added to receive the data based on groups of topics chosen in protocol