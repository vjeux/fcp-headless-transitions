__ZN9HGStencil21UpdateLocalParametersEi:
00000000002d2210	pushq	%rbp
00000000002d2211	movq	%rsp, %rbp
00000000002d2214	movss	0x1b0(%rdi), %xmm0
00000000002d221c	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
00000000002d2220	movslq	%esi, %rax
00000000002d2223	movq	0x198(%rdi), %rcx
00000000002d222a	movq	(%rcx,%rax,8), %rcx
00000000002d222e	movaps	%xmm0, 0x10(%rcx)
00000000002d2232	movq	0x198(%rdi), %rcx
00000000002d2239	movq	(%rcx,%rax,8), %rax
00000000002d223d	movaps	%xmm0, (%rax)
00000000002d2240	popq	%rbp
00000000002d2241	retq
00000000002d2242	nopw	%cs:(%rax,%rax)
