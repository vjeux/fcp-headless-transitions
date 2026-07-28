__ZN35HGCColorGamma_v210_yxzx_rgba_expand6GetROIEP10HGRendereri6HGRect:
00000000000fd060	pushq	%rbp
00000000000fd061	movq	%rsp, %rbp
00000000000fd064	testl	%edx, %edx
00000000000fd066	je	0xfd078
00000000000fd068	leaq	_HGRectNull(%rip), %rcx
00000000000fd06f	movq	(%rcx), %rax
00000000000fd072	movq	0x8(%rcx), %rdx
00000000000fd076	popq	%rbp
00000000000fd077	retq
00000000000fd078	imull	$0xaaaaaaab, %ecx, %eax         ## imm = 0xAAAAAAAB
00000000000fd07e	addl	$0x2aaaaaaa, %eax               ## imm = 0x2AAAAAAA
00000000000fd083	rorl	%eax
00000000000fd085	cmpl	$0x2aaaaaab, %eax               ## imm = 0x2AAAAAAB
00000000000fd08a	jb	0xfd0b0
00000000000fd08c	cvtsi2sd	%ecx, %xmm0
00000000000fd090	divsd	0x2d0288(%rip), %xmm0
00000000000fd098	cvtsd2ss	%xmm0, %xmm0
00000000000fd09c	roundss	$0x9, %xmm0, %xmm0
00000000000fd0a2	mulss	0x2cac1a(%rip), %xmm0
00000000000fd0aa	cvttss2si	%xmm0, %eax
00000000000fd0ae	jmp	0xfd0b2
00000000000fd0b0	movl	%ecx, %eax
00000000000fd0b2	movl	%r8d, %edx
00000000000fd0b5	subl	%eax, %edx
00000000000fd0b7	movslq	%edx, %rsi
00000000000fd0ba	imulq	$0x2aaaaaab, %rsi, %rdx         ## imm = 0x2AAAAAAB
00000000000fd0c1	movq	%rdx, %rdi
00000000000fd0c4	shrq	$0x3f, %rdi
00000000000fd0c8	shrq	$0x20, %rdx
00000000000fd0cc	addl	%edi, %edx
00000000000fd0ce	addl	%edx, %edx
00000000000fd0d0	leal	(%rdx,%rdx,2), %edx
00000000000fd0d3	subl	%edx, %esi
00000000000fd0d5	movl	%r8d, %edx
00000000000fd0d8	subl	%esi, %edx
00000000000fd0da	addl	$0x6, %edx
00000000000fd0dd	testl	%esi, %esi
00000000000fd0df	cmovel	%r8d, %edx
00000000000fd0e3	movabsq	$-0x100000000, %rsi             ## imm = 0xFFFFFFFF00000000
00000000000fd0ed	andq	%rsi, %r8
00000000000fd0f0	andq	%rsi, %rcx
00000000000fd0f3	movl	%eax, %eax
00000000000fd0f5	orq	%rcx, %rax
00000000000fd0f8	orq	%r8, %rdx
00000000000fd0fb	popq	%rbp
00000000000fd0fc	retq
00000000000fd0fd	nopl	(%rax)
