__ZN19FFRunningStatistics7addDataEd:
00000000012ed1d0	pushq	%rbp
00000000012ed1d1	movq	%rsp, %rbp
00000000012ed1d4	movapd	%xmm0, %xmm1
00000000012ed1d8	movupd	0x8(%rdi), %xmm2
00000000012ed1dd	movapd	%xmm2, %xmm0
00000000012ed1e1	blendpd	$0x1, %xmm1, %xmm0              ## xmm0 = xmm1[0],xmm0[1]
00000000012ed1e7	movapd	%xmm2, %xmm3
00000000012ed1eb	unpcklpd	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0]
00000000012ed1ef	cmpltpd	%xmm3, %xmm0
00000000012ed1f4	movddup	%xmm1, %xmm3                    ## xmm3 = xmm1[0,0]
00000000012ed1f8	blendvpd	%xmm0, %xmm3, %xmm2
00000000012ed1fd	movupd	%xmm2, 0x8(%rdi)
00000000012ed202	movq	(%rdi), %rax
00000000012ed205	incq	%rax
00000000012ed208	movq	%rax, (%rdi)
00000000012ed20b	movsd	0x18(%rdi), %xmm0
00000000012ed210	movapd	%xmm1, %xmm2
00000000012ed214	subsd	%xmm0, %xmm2
00000000012ed218	movq	%rax, %xmm3
00000000012ed21d	punpckldq	0x27f8bb(%rip), %xmm3   ## xmm3 = xmm3[0],mem[0],xmm3[1],mem[1]
00000000012ed225	subpd	0x27f8c3(%rip), %xmm3
00000000012ed22d	movapd	%xmm3, %xmm4
00000000012ed231	unpckhpd	%xmm3, %xmm4                    ## xmm4 = xmm4[1],xmm3[1]
00000000012ed235	addsd	%xmm3, %xmm4
00000000012ed239	movapd	%xmm2, %xmm3
00000000012ed23d	divsd	%xmm4, %xmm3
00000000012ed241	addsd	%xmm0, %xmm3
00000000012ed245	movsd	%xmm3, 0x18(%rdi)
00000000012ed24a	movapd	%xmm1, %xmm0
00000000012ed24e	subsd	%xmm3, %xmm0
00000000012ed252	mulsd	%xmm2, %xmm0
00000000012ed256	addsd	0x20(%rdi), %xmm0
00000000012ed25b	movsd	%xmm0, 0x20(%rdi)
00000000012ed260	movsd	%xmm1, 0x28(%rdi)
00000000012ed265	popq	%rbp
00000000012ed266	retq
00000000012ed267	nopw	(%rax,%rax)
