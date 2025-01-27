import './commonRequirementEnumeration.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { DocumentNode } from '../../components/DocumentNode';
import { LoadingAndErrorIndicator } from '../../components/LoadingAndErrorIndicator';
import { DOCUMENT_TYPE_NAMES } from '../../const';
import { useEnvironment } from '../../hooks';
import { Document } from '../../types';
import { groupLinksByType } from '../../utils';

export const CommonRequirementEnumeration = () => {
  const { id } = useParams();
  const { apiUrl } = useEnvironment();
  const [loading, setLoading] = useState<boolean>(false);

  const { error, data, refetch } = useQuery<{ data: Document; }, string>(
    'cre',
    () => fetch(`${apiUrl}/id/${id}`).then((res) => res.json()),
    {
      retry: false,
      enabled: false,
      onSettled: () => {
        setLoading(false);
      },
    }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    refetch();
  }, [id]);

  const cre = data?.data;
  const linksByType = useMemo(() => (cre ? groupLinksByType(cre) : {}), [cre]);

  return (
    <div className="cre-page">
      <LoadingAndErrorIndicator loading={loading} error={error} />
      {!loading && !error && cre && (
        <>
          <h4 className="cre-page__heading">{cre.name}</h4>
          <h5 className="cre-page__sub-heading">{cre.id}</h5>
          <div className="cre-page__description">{cre.description}</div>
          { cre && cre.hyperlink &&
            <>
              <span>Reference: </span>
              <a href={cre?.hyperlink} target="_blank"> { cre.hyperlink }</a>
            </>
          }
          <div className="cre-page__tags">Tags: {cre.tags?cre.tags.map((tag) => (<b>{tag} </b>)):""}</div>
          <div className="cre-page__links-container">
            {Object.keys(linksByType).length > 0 &&
              Object.entries(linksByType).map(([type, links]) => (
                <div className="cre-page__links" key={type}>
                  <div className="cre-page__links-eader">
                    {cre.id}: {cre.name} <b>{DOCUMENT_TYPE_NAMES[type]}</b>:
                  </div>
                  {links.map((link, i) => (
                    <div key={i} className="accordion ui fluid styled cre-page__links-container">
                      <DocumentNode node={link.document} linkType={type} />
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};
