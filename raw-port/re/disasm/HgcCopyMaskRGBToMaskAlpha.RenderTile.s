__ZN25HgcCopyMaskRGBToMaskAlpha10RenderTileEP6HGTile:
00000000006a2920	pushq	%rbp
00000000006a2921	movq	%rsp, %rbp
00000000006a2924	subq	$0x90, %rsp
00000000006a292b	movq	%rdi, -0x10(%rbp)
00000000006a292f	movq	%rsi, -0x18(%rbp)
00000000006a2933	movq	-0x10(%rbp), %rax
00000000006a2937	movq	%rax, -0x88(%rbp)
00000000006a293e	movq	-0x18(%rbp), %rdi
00000000006a2942	callq	0x6df882                        ## symbol stub for: __ZNK6HGTile8RendererEv
00000000006a2947	movq	%rax, %rdi
00000000006a294a	xorl	%esi, %esi
00000000006a294c	callq	0x6dd380                        ## symbol stub for: __ZN10HGRenderer9GetTargetEj
00000000006a2951	movl	%eax, -0x1c(%rbp)
00000000006a2954	cmpl	$0x4700000, -0x1c(%rbp)         ## imm = 0x4700000
00000000006a295b	jb	0x6a2975
00000000006a295d	movq	-0x88(%rbp), %rdi
00000000006a2964	movq	-0x18(%rbp), %rsi
00000000006a2968	callq	__ZN25HgcCopyMaskRGBToMaskAlpha14RenderTile_AVXEP6HGTile ## HgcCopyMaskRGBToMaskAlpha::RenderTile_AVX(HGTile*)
00000000006a296d	movl	%eax, -0x4(%rbp)
00000000006a2970	jmp	0x6a2ae4
00000000006a2975	movq	-0x18(%rbp), %rdi
00000000006a2979	callq	__ZNK6HGRect1wEv                ## HGRect::w() const
00000000006a297e	movl	%eax, -0x20(%rbp)
00000000006a2981	movq	-0x18(%rbp), %rdi
00000000006a2985	callq	__ZNK6HGTile6HeightEv           ## HGTile::Height() const
00000000006a298a	movl	%eax, -0x24(%rbp)
00000000006a298d	movq	-0x18(%rbp), %rax
00000000006a2991	movl	0x58(%rax), %eax
00000000006a2994	movl	%eax, -0x28(%rbp)
00000000006a2997	movq	-0x18(%rbp), %rax
00000000006a299b	movq	0x50(%rax), %rax
00000000006a299f	movq	%rax, -0x30(%rbp)
00000000006a29a3	movq	-0x18(%rbp), %rax
00000000006a29a7	movq	0x10(%rax), %rax
00000000006a29ab	movq	%rax, -0x38(%rbp)
00000000006a29af	movq	-0x18(%rbp), %rax
00000000006a29b3	movl	0x18(%rax), %eax
00000000006a29b6	movl	%eax, -0x3c(%rbp)
00000000006a29b9	movl	$0x0, -0x40(%rbp)
00000000006a29c0	movl	-0x40(%rbp), %eax
00000000006a29c3	cmpl	-0x24(%rbp), %eax
00000000006a29c6	jge	0x6a2add
00000000006a29cc	movl	$0x0, -0x44(%rbp)
00000000006a29d3	movl	-0x20(%rbp), %eax
00000000006a29d6	subl	-0x44(%rbp), %eax
00000000006a29d9	cmpl	$0x2, %eax
00000000006a29dc	jl	0x6a2a67
00000000006a29e2	movq	-0x30(%rbp), %rax
00000000006a29e6	movslq	-0x44(%rbp), %rcx
00000000006a29ea	shlq	$0x4, %rcx
00000000006a29ee	movaps	(%rax,%rcx), %xmm0
00000000006a29f2	movaps	%xmm0, -0x60(%rbp)
00000000006a29f6	movq	-0x30(%rbp), %rcx
00000000006a29fa	movslq	-0x44(%rbp), %rax
00000000006a29fe	shlq	$0x4, %rax
00000000006a2a02	movaps	0x10(%rax,%rcx), %xmm0
00000000006a2a07	movaps	%xmm0, -0x70(%rbp)
00000000006a2a0b	movaps	-0x60(%rbp), %xmm0
00000000006a2a0f	shufps	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000006a2a13	movaps	%xmm0, -0x60(%rbp)
00000000006a2a17	movaps	-0x70(%rbp), %xmm0
00000000006a2a1b	shufps	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000006a2a1f	movaps	%xmm0, -0x70(%rbp)
00000000006a2a23	movaps	-0x60(%rbp), %xmm0
00000000006a2a27	movq	-0x38(%rbp), %rax
00000000006a2a2b	movl	-0x44(%rbp), %ecx
00000000006a2a2e	addl	$0x0, %ecx
00000000006a2a31	movslq	%ecx, %rcx
00000000006a2a34	shlq	$0x4, %rcx
00000000006a2a38	addq	%rcx, %rax
00000000006a2a3b	movaps	%xmm0, (%rax)
00000000006a2a3e	movaps	-0x70(%rbp), %xmm0
00000000006a2a42	movq	-0x38(%rbp), %rax
00000000006a2a46	movl	-0x44(%rbp), %ecx
00000000006a2a49	addl	$0x1, %ecx
00000000006a2a4c	movslq	%ecx, %rcx
00000000006a2a4f	shlq	$0x4, %rcx
00000000006a2a53	addq	%rcx, %rax
00000000006a2a56	movaps	%xmm0, (%rax)
00000000006a2a59	movl	-0x44(%rbp), %eax
00000000006a2a5c	addl	$0x2, %eax
00000000006a2a5f	movl	%eax, -0x44(%rbp)
00000000006a2a62	jmp	0x6a29d3
00000000006a2a67	movl	-0x44(%rbp), %eax
00000000006a2a6a	cmpl	-0x20(%rbp), %eax
00000000006a2a6d	jge	0x6a2aa5
00000000006a2a6f	movq	-0x30(%rbp), %rax
00000000006a2a73	movslq	-0x44(%rbp), %rcx
00000000006a2a77	shlq	$0x4, %rcx
00000000006a2a7b	movaps	(%rax,%rcx), %xmm0
00000000006a2a7f	movaps	%xmm0, -0x80(%rbp)
00000000006a2a83	movaps	-0x80(%rbp), %xmm0
00000000006a2a87	shufps	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000006a2a8b	movaps	%xmm0, -0x80(%rbp)
00000000006a2a8f	movaps	-0x80(%rbp), %xmm0
00000000006a2a93	movq	-0x38(%rbp), %rax
00000000006a2a97	movslq	-0x44(%rbp), %rcx
00000000006a2a9b	shlq	$0x4, %rcx
00000000006a2a9f	addq	%rcx, %rax
00000000006a2aa2	movaps	%xmm0, (%rax)
00000000006a2aa5	movl	-0x28(%rbp), %ecx
00000000006a2aa8	movq	-0x30(%rbp), %rax
00000000006a2aac	movslq	%ecx, %rcx
00000000006a2aaf	shlq	$0x4, %rcx
00000000006a2ab3	addq	%rcx, %rax
00000000006a2ab6	movq	%rax, -0x30(%rbp)
00000000006a2aba	movl	-0x3c(%rbp), %ecx
00000000006a2abd	movq	-0x38(%rbp), %rax
00000000006a2ac1	movslq	%ecx, %rcx
00000000006a2ac4	shlq	$0x4, %rcx
00000000006a2ac8	addq	%rcx, %rax
00000000006a2acb	movq	%rax, -0x38(%rbp)
00000000006a2acf	movl	-0x40(%rbp), %eax
00000000006a2ad2	addl	$0x1, %eax
00000000006a2ad5	movl	%eax, -0x40(%rbp)
00000000006a2ad8	jmp	0x6a29c0
00000000006a2add	movl	$0x0, -0x4(%rbp)
00000000006a2ae4	movl	-0x4(%rbp), %eax
00000000006a2ae7	addq	$0x90, %rsp
00000000006a2aee	popq	%rbp
00000000006a2aef	retq
