import { Seo } from '@/components/common/Seo'
import { LOCAL_GALLERY } from '@/data/gallery'

export default function Credits() {
  return (
    <>
      <Seo title="Image Credits" path="/credits" description="Attribution for photographs used on the Golden Blocks Mission website." />
      <section className="bg-night pb-28 pt-40">
        <div className="container-x">
          <p className="eyebrow text-champagne">Attribution</p>
          <h1 className="display-lg mt-4">Image credits</h1>
          <p className="lede mt-6 max-w-2xl">
            We are grateful to the photographers whose work appears on this website. Photographs of churches and gatherings show Seventh-day Adventist congregations around the world and are illustrative, not Golden Blocks projects. Images are used under Creative Commons or public-domain terms and
            were colour-graded and resized for the web. Follow each source link for the original file and full licence.
          </p>
          <div className="mt-14 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-coal">
                <tr className="field-label">
                  <th className="p-4 font-normal">Image</th>
                  <th className="p-4 font-normal">Title</th>
                  <th className="p-4 font-normal">Author</th>
                  <th className="p-4 font-normal">Licence</th>
                  <th className="p-4 font-normal">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {LOCAL_GALLERY.map((g) => (
                  <tr key={g.id} className="text-silver-light/85">
                    <td className="p-3"><img src={g.thumb_url!.replace('-sm.webp', '-xs.webp')} alt="" loading="lazy" className="h-12 w-16 object-cover" /></td>
                    <td className="p-4">{g.title}</td>
                    <td className="p-4">{g.credit_author}</td>
                    <td className="p-4 font-mono text-xs">{g.credit_license}</td>
                    <td className="p-4"><a href={g.credit_source!} target="_blank" rel="noopener noreferrer" className="text-gold-bright underline-offset-2 hover:underline">Wikimedia Commons</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
