---
title: Advent Adventures - Prologue
date: 2023-12-19
summary: A preparation post for when I begin going through Advent of Code year-by-year
cowsay: Happy Holidays!
---

Over the past few years I've done [Advent of Code](https://adventofcode.com) on and off. At the time of writing, I'm on [day 19 of this year's challenge](https://adventofcode.com/2023/day/19) and will (hopefully) complete this year. After that, I want to go back and do all the previous years. I'll be writing a post for each year that I do, with a few highlights for the days I enjoyed and/or struggled with. I'll be using [Rust](https://www.rust-lang.org/) for all of my solutions, as it's a language I really want to learn in-depth.

Of course, I can't call myself a programmer if I don't needlessly over-complicate things. In addition to solving each day I want to keep everything organized, I want to make a repo for all of my Advent solutions. In addition to each year, I want to make a central utils crate that I can use across all years, I want this to be a sort of "swiss-army-knife" of competitive programming tactics/algorithms-- something I can look back on later for reference and also use next year.

I also want this repo to be easy to use. That is, I want it to be able to generate most of the boilerplate for me through macros. I want to be able to generate a year with a single command and have all the days of that year ready to be implemented.

This repo should also be able to make a single binary I can use to run any of my solutions across all of the years I've done.

Lets get started!

## The Project Structure

I'm going to be using [cargo workspaces](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html) to organize everything. The structure will look something like this:

```dir
advent/
├─ src/
├─ core/
│  ├─ Cargo.toml
│  ├─ src/
├─ macros/
│  ├─ Cargo.toml
│  ├─ src/
├─ util/
│  ├─ Cargo.toml
│  ├─ src/
├─ years/
│  ├─ 20XX/
│  │  ├─ Cargo.toml
│  │  ├─ src/
│  │  │  ├─ day_X.rs
├─ Cargo.toml
```

My top-level package is `advent`, this will be the main workspace. The `util` package will be a library that I can use across all years. Each year will be its own package, with its own `Cargo.toml` file. This will allow me to have a separate `main.rs` for each year, and also allow me to use the `util` package as a dependency.

### Core Package

This package will contain everything needed to work with days and parts. This should export a `Year` and `Day` trait that all years and days will implement. It will handle parsing arguments, getting the input from stdin, and timing the solutions. This package will be used by the year packages.

### Macros Package

This package will contain any macros I need. It's a proc macro crate.

### Year Packages

Each year will be a binary that I can run with `cargo run -p y_[YEAR] [DAY]:[PART]`. For example, to run the solution for day 1 part 2 of 2020 I would run `cargo run -p y_2022 1:2`. In addition, the binary can take a wild card to mean "run all days". For example, `cargo run -p y_2022 *` would run all days of 2020.

The binary will take input through stdin.

### Main Package

The main package will contain a binary that acts as a runner for all days. It will take a year, day, and part as arguments and run the corresponding binary. This package includes all the day packages as dependencies and simply acts as a runner for them.

### Utils Package

The utils package is pretty self-explanatory. It will contain a library that I can use over the years. This will only include things used in _solving the problems_ not running the days. Ideally, this will require no dependencies and would be easily transferred to other projects.

## The `Day` trait

The `Day` trait will be the main trait that all days will implement. It will have a few methods that will be used by the `Year` trait to run the days. Here's what it looks like:

```rs
pub trait Day {

    type Input;

    const EXAMPLE_INPUT_1: &'static str = "";
    const EXAMPLE_INPUT_2: &'static str = "";

    const EXPECTED_1: &'static str = "";
    const EXPECTED_2: &'static str = "";

    fn get_example_input(part: usize) -> &'static str {
        match part {
            1 => Self::EXAMPLE_INPUT_1,
            2 => Self::EXAMPLE_INPUT_2,
            _ => panic!("Invalid part number"),
        }
    }

    fn run_part(part: usize, input: Option<&str>) -> Option<String> {
        let input = input.unwrap_or_else(|| Self::get_example_input(part));
        let input = Self::parse_input(input);
        match part {
            1 => Self::part_1(input),
            2 => Self::part_2(input),
            _ => panic!("Invalid part number"),
        }
    }

    // ...

    fn parse_input(input: &str) -> Self::Input;

    fn part_1(_input: Self::Input) -> Option<String> { None }
    fn part_2(_input: Self::Input) -> Option<String> { None }

}
```

The general idea here is we have a few constants that contain the example input for each part. Then we have a few methods that will be used to run the days. The `get_example_input` method will be used to get the example input for a given part. The `run_part` method will be used to run a given part. The `parse_input` method will be used to parse the input into the type used by the day. Finally, the `part_1` and `part_2` methods will be used to run the parts.

Here we expect `part_1` and `part_2` to be implemented. However, they return `None` by default. This is so we can generate all 25 days of a year without having to implement all of them. If a day is not implemented, the runner will simply print a message saying that the day is not implemented.

Sadly `parse_input` will always have to be implemented, as there's no way to implement it by default. `I` here is a `String` by default, and since `parse_input` returns `I` one might think that for a default implementation, we could just return the input as-is. However, rust won't allow this as in the event `I` is changed to another type, the default implementation would no longer work. So we have to implement `parse_input` for each day. Implementing it isn't too bad, and could be part of a derive macro later on.

## The `Year` trait

The `Year` trait will be the main trait that all years will implement. It will have a few methods that will be used by the `core` package to run the days. Here's what it looks like:

```rs
pub trait Year {
    const YEAR: usize;

    fn solve_day(day: usize, part: usize, input: Option<&str>) -> Option<String>;

    fn solve_day_both_parts(day: usize, extra_indent: &str);

    fn solve_all_days() {
        println!("Year {}:", Self::YEAR);
        for day in 1..=MAX_DAY {
            Self::solve_day_both_parts(day, "  ");
        }
    }

    fn run_dp(input: Option<&str>, dp: DP) {
        match dp.day {
            Selection::All => {
                Self::solve_all_days();
            },
            Selection::Single(day) => {
                match dp.part {
                    Selection::All => {
                        Self::solve_day_both_parts(day, "");
                    },
                    Selection::Single(part) => {
                        Self::solve_day(day, part, input);
                    },
                }
            },
        }
    }
}
```

The general idea here is we have a few methods that will be used to run the days. The `solve_day` method will be used to run a given day. The `solve_day_both_parts` method will be used to run both parts of a given day. Finally, the `solve_all_days` method will be used to run all days. The extra indent is used to indent the output of the day so that it lines up with the year.

## Trying to implement a year

Now that we have a basic skeleton of what a year should look like, let's try to implement it! I'm going to be using the most recent year, 2023, as my testing grounds.

The layout of each year's package will look like this:

```dir
20XX/
├─ src/
│  ├─ main.rs
│  ├─ lib.rs
│  ├─ day_X.rs
├─ Cargo.toml
```

The `main.rs` file will be used to run the days. The `lib.rs` file will be used to implement the `Year` trait. The `day_X.rs` files will be used to implement the `Day` trait for each day.

Starting out I'm going to manually implement one day of 2023 and get my traits implemented. Then, I'm going to see where I can use macros, derive macros, and other things to make the process easier for subsequent days/years.

### Day 1

```rs
use core::Day;

pub struct Day1;

// Ideally most of this could be handled by a proc macro of some kind
impl Day for Day1 {

    type Input = String;

    const EXAMPLE_INPUT_1: &'static str = "...";
    // Defining examples and such...

    fn parse_input(input: &str) -> Self::Input {
        input.to_string()
    }

    fn part_1(input: Self::Input) -> Option<String> {
        //...
        Some(answer.to_string())
    }

    fn part_2(input: Self::Input) -> Option<String> {
        //...
        Some(answer.to_string())
    }
}
```

I still don't know how I entirely feel about making my Days return `String`s. It's fine for now and will come in handy if for some reason a problem needs a string as an answer. However, I think I might change it to return an `i64` instead. I'll have to see how it goes.

Now that I have a day implemented, I want to try and simplify defining it via a macro. I'm going to try and make a macro that will generate the `Day` trait implementation (or most of it) for me.

```rs
#[macro_export]
macro_rules! ex_for_day {
    ($day:literal, $part:literal) => {
        include_str!(concat!("examples/day_", stringify!($day), "/", stringify!($part), ".txt"))
    };
}

#[macro_export]
macro_rules! day_stuff {
    ($day:literal, $e_1:literal, $e_2:literal) => {
        day_stuff!($day, $e_1, $e_2, String);

        fn parse_input(input: &str) -> Self::Input {
            input.to_string()
        }
    };

    ($day:literal, $e_1:literal, $e_2:literal, $i: ty) => {
        type Input = $i;

        const DAY: usize = $day;
        const EXAMPLE_INPUT_1: &'static str = ex_for_day!($day, 1);
        const EXAMPLE_INPUT_2: &'static str = ex_for_day!($day, 2);
        const EXPECTED_1: &'static str = $e_1;
        const EXPECTED_2: &'static str = $e_2;
    }
}
```

Here we can see I have two macros. The first one, `ex_for_day`, is used to get the example input for a given day and part. The second one, `day_stuff`, is used to generate part of the `Day` trait implementation. It takes the day number, the expected answers, and the type of the input. It then generates the `Input` type, the example inputs, and the expected answers. Finally, it generates the `parse_input` method.

If no input type is given, it defaults to `String`. This is because I want to be able to use this macro for all days, and I don't want to have to specify the input type for each day.

In theory, I could use proc-macros here to generate more of the file. However, proc macros tend to mess with debugging output / hide what scopes things are defined in. I want to be able to debug my code, so I'm going to stick with these macros for now.

Now, I need to be able to generate a `Year` trait implementation. This will be a bit more complicated than the `Day` trait implementation, as I need to generate a `match` statement for each day. I'm going to try and make a macro that will generate the `Year` trait implementation for me.

### Year 2023

After getting the `Year` trait implemented for 2023, here's what it looks like:

```rs
mod day_1;

use core::{Day, Year};

use day_1::Day1;

pub struct Year2023;

impl Year for Year2023 {

    const YEAR: usize = 2023;

    fn solve_day(day: usize, part: usize, input: Option<&str>) -> Option<String> {
        match day {
            1 => Day1::run_part(part, input),
            _ => None,
        }
    }

    fn solve_day_both_parts(day: usize, extra_indent: &str) {
        match day {
            1 => Day1::run_all_parts(extra_indent),
            _ => (),
        }
    }

}
```

This looks like it can be placed in a proc macro as all we're _really changing_ here is the year number, the rest should be carbon copy for all years. So I created a simple proc macro that basically has the `pub struct` and `impl` blocks as a template, and will replace the year number with the proper year:

```rs
extern crate proc_macro;

use proc_macro::TokenStream;

const YEAR_TEMPLATE: &str = include_str!("template_year.rs");

#[proc_macro]
pub fn year(item: TokenStream) -> TokenStream {
    let year = item.to_string();

    YEAR_TEMPLATE.replace("__YEAR__", &year).parse().unwrap()
}
```

After expanding this to include mod statements, use statements, and tests, I get the ability to simply do:

```rs
use macros::year;

year!(2023);
```

to automatically make a runner and tester for all the days in 2023.

#### Adding the Year Runner

Up until now, I haven't shown _how_ running problems is going to work. The year binaries will parse the arguments into a struct called `DP` (day, part). This struct will then be used to find the correct day and part to run. Here's what it looks like:

```rs
#[derive(Clone, Debug)]
pub enum Selection {
    All,
    Single(usize), // TODO: Add range maybe?
}

pub struct DP {
    pub day: Selection,
    pub part: Selection,
}
```

The parsing for this is pretty simple, split by `:`, then parse each part. If the part is `*` then it's `Selection::All`, otherwise it's `Selection::Single`.

Now I can simply pass this to the `Year` trait's `run_dp` method and it will run the correct day and part.

For the final bit, we need a way to get the `input` we want to run. To do this, I accept the input as a second argument to the binary. If no input is given, we'll use the example input. If the user passes `-`, we will read from stdin. Otherwise, we will simply use the input given.

Combining parsing the DP and the input we get this handy utility method:

```rs
pub fn get_dp_and_input() -> (DP, Option<String>) {
    let mut args = args().skip(1);

    let dp = args.next().map(|s| DP::parse(&s.trim())).unwrap_or(DP_ALL);

    let input = args.next().map(|s| s.trim().to_string()).map(|i| {
        if i == "-" {
            let mut input = String::new();
            stdin().read_to_string(&mut input).expect("Failed to read input");
            input.trim().to_string()
        } else {
            i
        }
    });

    (dp, input)
}
```

All we need in `main.rs` for our years now is some glue code:

```rs
use core::{Year, get_dp_and_input};

use y_2023::Year2023;

fn main() {
    let (dp, input) = get_dp_and_input();
    Year2023::run_dp(input.as_deref(), dp);
}
```

We can run our year with `cargo run -p y_2023 1:1` and it will run day 1 part 1 of 2023. We can also run `cargo run -p y_2023 1:*` to run both parts of day 1, or `cargo run -p y_2023 *` to run all days of 2023.

It's a bit overkill, but I made a proc macro to generate this glue code for me:

```rs
#[proc_macro]
pub fn year_runner(item: TokenStream) -> TokenStream {
    let year = item.to_string();

    format!("
    use core::{{Year, get_dp_and_input}};

    use y_{year}::Year{year};

    fn main() {{
        let (dp, input) = get_dp_and_input();
        Year{year}::run_dp(input.as_deref(), dp);
    }}").parse::<TokenStream>().unwrap()
}
```

### Generating Days / Years

Now that I've got a basic skeleton for a day and year, I want to be able to generate them. I'm going to make a function in my `core` package that will let me generate a day to a given file given the day's number. Then I'm gonna write a function that can generate an entire year (and its rust project) given the year's number.

So to generate an entire year crate I need to:

1. Create a directory for the year in `years/`
2. Initialize a `Cargo.toml` file
    1. Name it `y_[YEAR]`
    2. Add the `core` package as a dependency
    3. Add the `util` package as a dependency
    4. Add the `macros` package as a dependency
3. Make a `src/` folder
    1. Make example files for every day in the year in `examples/day_[DAY]/[PART].txt`
    2. Make a `day_[DAY].rs` file for each day, with a definition for the Day and a call to `day_stuff!`
    3. Make a `lib.rs` file that has a single macro call to `year!([YEAR]);`
    4. Make a `main.rs` file that has a single macro call to `year_runner!([YEAR]);`
4. Add the year as a dependency to the `Cargo.toml` file in the root of the project

The logic for this is pretty rudimentary so I'm going to not include it here. Basically, the main binary will take a year number and generate the year crate for that year. It will also add the year crate as a dependency to the root `Cargo.toml` file.

### The Main Binary

The main binary is used for two things:

1. It's the thing that you run to actually generate years
2. It can run any year, day, and part. It does this by compiling all years into itself

The first step is making a simple CLI parser. I want it to be able to take 2 commands `new` and `solve`. `new` is used to generate a new year, and `solve` is used to run a year, day, and part. Here's what the CLI parser looks like:

```rs
let args = std::env::args().skip(1).collect::<Vec<_>>();

 let command = args.get(0);

 match command {
     Some(command) => {
         match command.as_str() {
             "new" => {
                 let year = args.get(1).expect("No year provided");
                 make_year(year);
             },
             "solve" | "run" => {
                 let (ydp, input) = get_ydp_and_input(args[1..].to_vec());
                 run_ydp(ydp, input);
             }
             _ => {
                 println!("Unknown command: {}", command);
                 println!("Available commands: new, solve");
             }
         }
     },
     None => {
         println!("No command provided");
         println!("Available commands: new, solve");
     }
 }
```

After that, we need to connect `new` to `core::make_year` and then `solve` to a match statement that will run the correct year, day, and part.

To generate this match statement (and use statements) I once again turn to a proc macro. These macros are pretty much the same for days, they have a match that takes a year number and will run the corresponding year.

### Testing

Now that we have a project generation command we're done! This allows us to generate a new year crate, auto-updating the main binary to include it as a dependency. The crate will have all 25 days generated, with the `Day` trait implemented for each day. The `Year` trait will also be implemented for the year. Now we can run the year's binary through `cargo run -p y_[YEAR] [DAY]:[PART]` and it will run the correct day and part. Or we can run `cargo run solve [YEAR]:[DAY]:[PART]` to get the same result.

I'll start by generating all 25 days for 2023. Up until now, I've only been generating one day per year for simplicity.

So now my y_2023 crate has a `day_x.rs` file for every day until the 25th. I can now run `cargo run solve 2023:*` to run every single day of the year. Although they're not implemented yet, it will just print that the day is not implemented.

### Conclusion

So now I have an automated repo for solving Advent of Code. I can generate a new year, and it will generate all 25 days for that year. I then implement the days and run them through the main binary. I'm going to hold off on transferring my 2023 solutions to this repo until it's over. After which I want to take a look at all of the days in 2023 and see what I can extract into the `utils` crate and `macros` crate.

And with that, I'm done with this post! Stay tuned for a "Prologue part 2" / "2023" post where I go over some of the highlights of 2023 for me and describe what logic I'm extracting into the `utils` crate and `macros` crate.
