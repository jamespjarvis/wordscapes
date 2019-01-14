#!/bin/bash

head -$2 $1 | sed 's/\s[0-9]*//g' | awk 'length($0)>2 && length($0)<15' | awk '{ print length, $0 }' | sort -n | cut -d " " -f2 > words.txt