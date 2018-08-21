import React from 'react';
import PropTypes from 'prop-types';



export default class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      records: [],
      totalRecords: 0,
      okapiToken: ''
    };
  }

  componentDidMount() {
    fetch('http://localhost:9130/authn/login', {
        method: 'POST',
        body: JSON.stringify({
          'username': 'diku_admin',
          'password': 'admin'
        }),
        headers: new Headers({
          'Content-type': 'application/json',
          'X-Okapi-Tenant': 'diku',
        })
      })
      .then((res) => {
        this.setState({
          okapiToken: res.headers.get("x-okapi-token")
        })
      })
      .then(() => {
        var currentCount = 0;

        fetch('http://localhost:9130/instance-storage/instances?limit=30&offset=' + currentCount + '&query=%28title%3D%22%2A%22%20or%20contributors%20adj%20%22%5C%22name%5C%22%3A%20%5C%22%2A%5C%22%22%20or%20identifiers%20adj%20%22%5C%22value%5C%22%3A%20%5C%22%2A%5C%22%22%29%20sortby%20title', {
            method: 'GET',
            headers: new Headers({
              'Content-type': 'application/json',
              'X-Okapi-Tenant': 'diku',
              'X-Okapi-Token': this.state.okapiToken
            })
          })
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                isLoaded: true,
                records: result.instances,
                totalRecords: result.totalRecords
              });
            }, (error) => {
              this.setState({
                isLoaded: true,
                error
              });
            }
          )
          .then(
            () => {
              currentCount += 30;
              while (currentCount < this.state.totalRecords) {
                fetch('http://localhost:9130/instance-storage/instances?limit=30&offset=' + currentCount + '&query=%28title%3D%22%2A%22%20or%20contributors%20adj%20%22%5C%22name%5C%22%3A%20%5C%22%2A%5C%22%22%20or%20identifiers%20adj%20%22%5C%22value%5C%22%3A%20%5C%22%2A%5C%22%22%29%20sortby%20title', {
                    method: 'GET',
                    headers: new Headers({
                      'Content-type': 'application/json',
                      'X-Okapi-Tenant': 'diku',
                      'X-Okapi-Token': this.state.okapiToken
                    })
                  }).then(res => res.json())
                  .then(
                    (response) => {
                      for (var i = 0; i < response.instances.length; i++) {
                        this.setState(previousState => ({
                          records: [...previousState.records, response.instances[i]]
                        }));
                      }
                    }, (error) => {
                      this.setState({
                        isLoaded: true,
                        error
                      });
                    }
                  )
                currentCount += 30;
              }
            }
          );

      })

  }
  render() {
    const {
      error, isLoaded, items
    } = this.state;
    if (error) {
      return <div > Error: {
        error.message
      } < /div>;
    } else if (!isLoaded) {
      return <div > Loading... < /div>;
    } else {
      // <folio-report-module records={this.state.records} />
      return ( <div>{this.state.records[0].title}</div>);
    }
  }
}
