__ZN12HGColorGamma10RenderTileEP6HGTile:
00000000000f5000	cmpq	$0x0, 0x1a0(%rdi)
00000000000f5008	je	0xf50a9
00000000000f500e	pushq	%rbp
00000000000f500f	movq	%rsp, %rbp
00000000000f5012	pushq	%r14
00000000000f5014	pushq	%rbx
00000000000f5015	movq	%rsi, %r14
00000000000f5018	movq	%rdi, %rbx
00000000000f501b	movq	%rsi, %rdi
00000000000f501e	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000000f5023	movq	%rax, %rdi
00000000000f5026	xorl	%esi, %esi
00000000000f5028	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000000f502d	movq	(%r14), %rsi
00000000000f5030	movq	0x8(%r14), %rdx
00000000000f5034	movl	0x18(%r14), %ecx
00000000000f5038	subl	%edx, %ecx
00000000000f503a	addl	%esi, %ecx
00000000000f503c	movq	0x10(%r14), %rdi
00000000000f5040	movq	0x198(%rbx), %r9
00000000000f5047	movq	0x1a0(%rbx), %r8
00000000000f504e	cmpl	$0x4700000, %eax                ## imm = 0x4700000
00000000000f5053	jb	0xf505c
00000000000f5055	callq	__Z12ReadTile_AVXPDv4_f6HGRectiP8HGBitmapPK25hgColorGammaTransformData ## ReadTile_AVX(float vector[4]*, HGRect, int, HGBitmap*, hgColorGammaTransformData const*)
00000000000f505a	jmp	0xf5061
00000000000f505c	callq	__Z12ReadTile_SSEPDv4_f6HGRectiP8HGBitmapPK25hgColorGammaTransformData ## ReadTile_SSE(float vector[4]*, HGRect, int, HGBitmap*, hgColorGammaTransformData const*)
00000000000f5061	movq	0x8(%r14), %xmm0
00000000000f5067	movq	(%r14), %xmm1
00000000000f506c	psubd	%xmm1, %xmm0
00000000000f5070	pextrd	$0x1, %xmm0, %eax
00000000000f5076	movd	%xmm0, %ecx
00000000000f507a	imull	%ecx, %eax
00000000000f507d	movq	0x150(%r14), %rcx
00000000000f5084	movq	0x1a8(%rcx), %rdi
00000000000f508b	movslq	%eax, %rdx
00000000000f508e	movq	0x1a0(%rbx), %rax
00000000000f5095	movq	0x38(%rax), %rcx
00000000000f5099	imulq	%rdx, %rcx
00000000000f509d	movq	%rbx, %rsi
00000000000f50a0	callq	__ZN7HGStats9UnitStats8readTileEP6HGNodexx ## HGStats::UnitStats::readTile(HGNode*, long long, long long)
00000000000f50a5	popq	%rbx
00000000000f50a6	popq	%r14
00000000000f50a8	popq	%rbp
00000000000f50a9	xorl	%eax, %eax
00000000000f50ab	retq
00000000000f50ac	nopl	(%rax)
