interface AllVersionsItem {
  name: string;
  updated: string;
  created: string;
  identifier: string;
}

interface AllVersionsType extends Array<AllVersionsItem> {}

interface Version {
  id: string;
  name: string;
  changelog: string;
  created: string;
  identifier: string;
  published: boolean;
  published_on: string;
  updated: string;
}

interface VersionWithLinks extends Version {
  links?: Link[];
}
