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
+ Removed variables.env to create it from variablesTemplate.env
+ Now GUI can be placed from an other GitHub Repository and replaced

## Version 0.6.5

2023.02.06

+ Now device can post measurements with a token given at device creation without do a login with user credential

## Version 0.6.6

2023.02.13

+ Added description and tags fields for items in feature

## Version 0.6.7

2023.02.27

+ Added get groups of topics
+ Optimized load measurements from csv file

## Version 0.6.8

2023.04.13

+ Added limit=-1 to get all measurements in CSV, CSV+ and Dataframe format
+ Added replace separator for CSV, CSV+
+ CSV bug Fixes and improvements

## Version 0.6.9

2023.04.20

+ .JSON description file now use '_' symbol in items array for csv values missing and set it as null.
+ Get all tenants name route.

## Version 0.7.0

2023.05.09

+ Improve token device to get device thing tag, post measurements and timeseries
+ Support to store more certificates for different url at the same GUI 