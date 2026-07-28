__ZN44HgcBilateralFilterInterpSC_InterpolatorLastX10RenderTileEP6HGTile:
000000000031cbd0	pushq	%rbp
000000000031cbd1	movq	%rsp, %rbp
000000000031cbd4	pushq	%r15
000000000031cbd6	pushq	%r14
000000000031cbd8	pushq	%r13
000000000031cbda	pushq	%r12
000000000031cbdc	pushq	%rbx
000000000031cbdd	subq	$0x18, %rsp
000000000031cbe1	movq	%rsi, %r14
000000000031cbe4	movq	%rdi, %rbx
000000000031cbe7	movq	%rsi, %rdi
000000000031cbea	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
000000000031cbef	movq	%rax, %rdi
000000000031cbf2	xorl	%esi, %esi
000000000031cbf4	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000031cbf9	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000031cbfe	jb	0x31cc10
000000000031cc00	movq	%rbx, %rdi
000000000031cc03	movq	%r14, %rsi
000000000031cc06	callq	__ZN44HgcBilateralFilterInterpSC_InterpolatorLastX14RenderTile_AVXEP6HGTile ## HgcBilateralFilterInterpSC_InterpolatorLastX::RenderTile_AVX(HGTile*)
000000000031cc0b	jmp	0x31cd4e
000000000031cc10	movl	0xc(%r14), %eax
000000000031cc14	subl	0x4(%r14), %eax
000000000031cc18	movl	%eax, -0x2c(%rbp)
000000000031cc1b	jle	0x31cd4e
000000000031cc21	movl	0x8(%r14), %ecx
000000000031cc25	subl	(%r14), %ecx
000000000031cc28	testl	%ecx, %ecx
000000000031cc2a	jle	0x31cd4e
000000000031cc30	movslq	0x18(%r14), %rsi
000000000031cc34	movslq	0x88(%r14), %rdi
000000000031cc3b	movslq	0x78(%r14), %r8
000000000031cc3f	movslq	0x68(%r14), %rax
000000000031cc43	movslq	0x58(%r14), %rdx
000000000031cc47	movq	0x10(%r14), %r9
000000000031cc4b	movq	0x50(%r14), %r10
000000000031cc4f	movq	0x60(%r14), %r11
000000000031cc53	movq	0x70(%r14), %r15
000000000031cc57	movq	0x80(%r14), %r14
000000000031cc5e	movl	%ecx, %r12d
000000000031cc61	shlq	$0x4, %rdx
000000000031cc65	movq	%rdx, -0x38(%rbp)
000000000031cc69	shlq	$0x4, %rax
000000000031cc6d	shlq	$0x4, %r8
000000000031cc71	shlq	$0x4, %rdi
000000000031cc75	shlq	$0x4, %rsi
000000000031cc79	shlq	$0x4, %r12
000000000031cc7d	xorl	%r13d, %r13d
000000000031cc80	xorl	%ecx, %ecx
000000000031cc82	nopw	%cs:(%rax,%rax)
000000000031cc90	movaps	(%r10,%rcx), %xmm0
000000000031cc95	movaps	(%r11,%rcx), %xmm3
000000000031cc9a	movaps	(%r15,%rcx), %xmm2
000000000031cc9f	movq	0x198(%rbx), %rdx
000000000031cca6	minss	0x4(%rdx), %xmm0
000000000031ccab	movss	(%rdx), %xmm1
000000000031ccaf	cmpless	%xmm0, %xmm1
000000000031ccb4	andps	0x20(%rdx), %xmm1
000000000031ccb8	movaps	%xmm3, %xmm4
000000000031ccbb	shufps	$0xff, %xmm3, %xmm4             ## xmm4 = xmm4[3,3],xmm3[3,3]
000000000031ccbf	movaps	0x40(%rdx), %xmm5
000000000031ccc3	movaps	%xmm2, %xmm6
000000000031ccc6	movss	0x8(%rdx), %xmm7
000000000031cccb	mulss	%xmm0, %xmm7
000000000031cccf	addss	0xc(%rdx), %xmm7
000000000031ccd4	shufps	$0xff, %xmm2, %xmm6             ## xmm6 = xmm6[3,3],xmm2[3,3]
000000000031ccd8	maxss	%xmm5, %xmm4
000000000031ccdc	rcpss	%xmm4, %xmm4
000000000031cce0	movss	0x60(%rdx), %xmm8
000000000031cce6	mulss	%xmm8, %xmm4
000000000031cceb	mulss	%xmm3, %xmm4
000000000031ccef	maxss	%xmm5, %xmm6
000000000031ccf3	xorps	%xmm3, %xmm3
000000000031ccf6	rcpss	%xmm6, %xmm3
000000000031ccfa	mulss	%xmm8, %xmm3
000000000031ccff	mulss	%xmm2, %xmm3
000000000031cd03	subss	%xmm4, %xmm3
000000000031cd07	mulss	%xmm7, %xmm3
000000000031cd0b	addss	%xmm4, %xmm3
000000000031cd0f	mulss	%xmm1, %xmm3
000000000031cd13	addss	(%r14,%rcx), %xmm3
000000000031cd19	blendps	$0xe, %xmm0, %xmm3              ## xmm3 = xmm3[0],xmm0[1,2,3]
000000000031cd1f	movaps	%xmm3, (%r9,%rcx)
000000000031cd24	addq	$0x10, %rcx
000000000031cd28	cmpq	%rcx, %r12
000000000031cd2b	jne	0x31cc90
000000000031cd31	incl	%r13d
000000000031cd34	addq	-0x38(%rbp), %r10
000000000031cd38	addq	%rax, %r11
000000000031cd3b	addq	%r8, %r15
000000000031cd3e	addq	%rdi, %r14
000000000031cd41	addq	%rsi, %r9
000000000031cd44	cmpl	-0x2c(%rbp), %r13d
000000000031cd48	jne	0x31cc80
000000000031cd4e	xorl	%eax, %eax
000000000031cd50	addq	$0x18, %rsp
000000000031cd54	popq	%rbx
000000000031cd55	popq	%r12
000000000031cd57	popq	%r13
000000000031cd59	popq	%r14
000000000031cd5b	popq	%r15
000000000031cd5d	popq	%rbp
000000000031cd5e	retq
000000000031cd5f	nop
