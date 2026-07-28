__ZN25HgcBT2100_HLG_InverseOETF10RenderTileEP6HGTile:
00000000003b1940	pushq	%rbp
00000000003b1941	movq	%rsp, %rbp
00000000003b1944	pushq	%r14
00000000003b1946	pushq	%rbx
00000000003b1947	movq	%rsi, %r14
00000000003b194a	movq	%rdi, %rbx
00000000003b194d	movq	%rsi, %rdi
00000000003b1950	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000003b1955	movq	%rax, %rdi
00000000003b1958	xorl	%esi, %esi
00000000003b195a	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000003b195f	cmpl	$0x4700000, %eax                ## imm = 0x4700000
00000000003b1964	jb	0x3b1978
00000000003b1966	movq	%rbx, %rdi
00000000003b1969	movq	%r14, %rsi
00000000003b196c	callq	__ZN25HgcBT2100_HLG_InverseOETF14RenderTile_AVXEP6HGTile ## HgcBT2100_HLG_InverseOETF::RenderTile_AVX(HGTile*)
00000000003b1971	xorl	%eax, %eax
00000000003b1973	popq	%rbx
00000000003b1974	popq	%r14
00000000003b1976	popq	%rbp
00000000003b1977	retq
00000000003b1978	movl	0x8(%r14), %r9d
00000000003b197c	subl	(%r14), %r9d
00000000003b197f	movl	0xc(%r14), %ecx
00000000003b1983	subl	0x4(%r14), %ecx
00000000003b1987	movslq	0x58(%r14), %rdx
00000000003b198b	movq	0x50(%r14), %rsi
00000000003b198f	movq	0x10(%r14), %rdi
00000000003b1993	movslq	0x18(%r14), %r8
00000000003b1997	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
00000000003b199c	jbe	0x3b1b14
00000000003b19a2	testl	%ecx, %ecx
00000000003b19a4	jle	0x3b1971
00000000003b19a6	testl	%r9d, %r9d
00000000003b19a9	jle	0x3b1971
00000000003b19ab	movl	%r9d, %eax
00000000003b19ae	shlq	$0x4, %rdx
00000000003b19b2	shlq	$0x4, %r8
00000000003b19b6	shlq	$0x4, %rax
00000000003b19ba	xorl	%r9d, %r9d
00000000003b19bd	nopl	(%rax)
00000000003b19c0	xorl	%r10d, %r10d
00000000003b19c3	nopw	%cs:(%rax,%rax)
00000000003b19d0	movaps	(%rsi,%r10), %xmm1
00000000003b19d5	movq	0x198(%rbx), %r11
00000000003b19dc	movaps	(%r11), %xmm0
00000000003b19e0	movaps	0x20(%r11), %xmm2
00000000003b19e5	movaps	0x40(%r11), %xmm3
00000000003b19ea	movaps	0x100(%r11), %xmm8
00000000003b19f2	movaps	%xmm1, %xmm4
00000000003b19f5	maxps	%xmm3, %xmm4
00000000003b19f8	movaps	%xmm2, %xmm5
00000000003b19fb	shufps	$0x0, %xmm2, %xmm5              ## xmm5 = xmm5[0,0],xmm2[0,0]
00000000003b19ff	mulps	%xmm4, %xmm5
00000000003b1a02	movaps	%xmm2, %xmm9
00000000003b1a06	shufps	$0x55, %xmm2, %xmm9             ## xmm9 = xmm9[1,1],xmm2[1,1]
00000000003b1a0b	addps	%xmm5, %xmm9
00000000003b1a0f	blendps	$0x8, %xmm1, %xmm9              ## xmm9 = xmm9[0,1,2],xmm1[3]
00000000003b1a16	movaps	%xmm4, %xmm10
00000000003b1a1a	mulps	%xmm4, %xmm10
00000000003b1a1e	movaps	0x120(%r11), %xmm7
00000000003b1a26	movaps	%xmm7, %xmm5
00000000003b1a29	cmpleps	%xmm9, %xmm5
00000000003b1a2e	andps	%xmm8, %xmm5
00000000003b1a32	blendps	$0x8, %xmm5, %xmm4              ## xmm4 = xmm4[0,1,2],xmm5[3]
00000000003b1a38	movaps	%xmm0, %xmm6
00000000003b1a3b	shufps	$0x55, %xmm0, %xmm6             ## xmm6 = xmm6[1,1],xmm0[1,1]
00000000003b1a3f	mulps	%xmm10, %xmm6
00000000003b1a43	maxps	0x60(%r11), %xmm9
00000000003b1a48	roundps	$0x9, %xmm9, %xmm10
00000000003b1a4f	subps	%xmm10, %xmm9
00000000003b1a53	movaps	%xmm9, %xmm11
00000000003b1a57	mulps	%xmm9, %xmm11
00000000003b1a5b	movaps	0x80(%r11), %xmm12
00000000003b1a63	mulps	%xmm9, %xmm12
00000000003b1a67	addps	0xa0(%r11), %xmm12
00000000003b1a6f	mulps	%xmm11, %xmm12
00000000003b1a73	movaps	0xc0(%r11), %xmm11
00000000003b1a7b	mulps	%xmm9, %xmm11
00000000003b1a7f	addps	0xe0(%r11), %xmm11
00000000003b1a87	addps	%xmm12, %xmm11
00000000003b1a8b	mulps	%xmm9, %xmm11
00000000003b1a8f	addps	%xmm8, %xmm11
00000000003b1a93	mulps	%xmm9, %xmm11
00000000003b1a97	addps	%xmm7, %xmm11
00000000003b1a9b	cvttps2dq	%xmm10, %xmm8
00000000003b1aa0	paddd	0x140(%r11), %xmm8
00000000003b1aa9	pslld	$0x17, %xmm8
00000000003b1aaf	mulps	%xmm11, %xmm8
00000000003b1ab3	movaps	%xmm2, %xmm9
00000000003b1ab7	shufps	$0xaa, %xmm2, %xmm9             ## xmm9 = xmm9[2,2],xmm2[2,2]
00000000003b1abc	mulps	%xmm8, %xmm9
00000000003b1ac0	shufps	$0xff, %xmm2, %xmm2             ## xmm2 = xmm2[3,3,3,3]
00000000003b1ac4	addps	%xmm9, %xmm2
00000000003b1ac8	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
00000000003b1acc	cmpltps	%xmm4, %xmm0
00000000003b1ad0	andps	%xmm7, %xmm0
00000000003b1ad3	blendps	$0x8, %xmm5, %xmm0              ## xmm0 = xmm0[0,1,2],xmm5[3]
00000000003b1ad9	cmpnleps	%xmm3, %xmm0
00000000003b1add	blendvps	%xmm0, %xmm2, %xmm6
00000000003b1ae2	mulps	%xmm1, %xmm5
00000000003b1ae5	blendps	$0x7, %xmm6, %xmm5              ## xmm5 = xmm6[0,1,2],xmm5[3]
00000000003b1aeb	movaps	%xmm5, (%rdi,%r10)
00000000003b1af0	addq	$0x10, %r10
00000000003b1af4	cmpq	%r10, %rax
00000000003b1af7	jne	0x3b19d0
00000000003b1afd	incl	%r9d
00000000003b1b00	addq	%rdx, %rsi
00000000003b1b03	addq	%r8, %rdi
00000000003b1b06	cmpl	%ecx, %r9d
00000000003b1b09	jne	0x3b19c0
00000000003b1b0f	jmp	0x3b1971
00000000003b1b14	testl	%ecx, %ecx
00000000003b1b16	jle	0x3b1971
00000000003b1b1c	testl	%r9d, %r9d
00000000003b1b1f	jle	0x3b1971
00000000003b1b25	movl	%r9d, %eax
00000000003b1b28	shlq	$0x4, %rdx
00000000003b1b2c	shlq	$0x4, %r8
00000000003b1b30	shlq	$0x4, %rax
00000000003b1b34	xorl	%r9d, %r9d
00000000003b1b37	nopw	(%rax,%rax)
00000000003b1b40	xorl	%r10d, %r10d
00000000003b1b43	nopw	%cs:(%rax,%rax)
00000000003b1b50	movaps	(%rsi,%r10), %xmm7
00000000003b1b55	movq	0x198(%rbx), %r11
00000000003b1b5c	movaps	(%r11), %xmm0
00000000003b1b60	movaps	0x20(%r11), %xmm1
00000000003b1b65	movaps	0x40(%r11), %xmm2
00000000003b1b6a	movaps	0x100(%r11), %xmm6
00000000003b1b72	movaps	0x160(%r11), %xmm3
00000000003b1b7a	movaps	%xmm3, %xmm4
00000000003b1b7d	andnps	%xmm7, %xmm4
00000000003b1b80	maxps	%xmm2, %xmm7
00000000003b1b83	movaps	%xmm1, %xmm5
00000000003b1b86	shufps	$0x0, %xmm1, %xmm5              ## xmm5 = xmm5[0,0],xmm1[0,0]
00000000003b1b8a	mulps	%xmm7, %xmm5
00000000003b1b8d	movaps	%xmm1, %xmm9
00000000003b1b91	shufps	$0x55, %xmm1, %xmm9             ## xmm9 = xmm9[1,1],xmm1[1,1]
00000000003b1b96	addps	%xmm5, %xmm9
00000000003b1b9a	andps	%xmm3, %xmm9
00000000003b1b9e	orps	%xmm4, %xmm9
00000000003b1ba2	movaps	0x120(%r11), %xmm5
00000000003b1baa	movaps	%xmm5, %xmm10
00000000003b1bae	cmpleps	%xmm9, %xmm10
00000000003b1bb3	maxps	0x60(%r11), %xmm9
00000000003b1bb8	cvtps2dq	%xmm9, %xmm8
00000000003b1bbd	cvtdq2ps	%xmm8, %xmm8
00000000003b1bc1	movaps	%xmm9, %xmm11
00000000003b1bc5	cmpltps	%xmm8, %xmm11
00000000003b1bca	cvtdq2ps	%xmm11, %xmm11
00000000003b1bce	addps	%xmm8, %xmm11
00000000003b1bd2	subps	%xmm11, %xmm9
00000000003b1bd6	movaps	%xmm9, %xmm8
00000000003b1bda	mulps	%xmm9, %xmm8
00000000003b1bde	movaps	0x80(%r11), %xmm12
00000000003b1be6	mulps	%xmm9, %xmm12
00000000003b1bea	addps	0xa0(%r11), %xmm12
00000000003b1bf2	mulps	%xmm8, %xmm12
00000000003b1bf6	movaps	0xc0(%r11), %xmm13
00000000003b1bfe	mulps	%xmm9, %xmm13
00000000003b1c02	addps	0xe0(%r11), %xmm13
00000000003b1c0a	movaps	0x180(%r11), %xmm8
00000000003b1c12	addps	%xmm12, %xmm13
00000000003b1c16	mulps	%xmm9, %xmm13
00000000003b1c1a	addps	%xmm6, %xmm13
00000000003b1c1e	andps	%xmm8, %xmm6
00000000003b1c22	andps	%xmm10, %xmm6
00000000003b1c26	movaps	%xmm8, %xmm10
00000000003b1c2a	andnps	%xmm7, %xmm10
00000000003b1c2e	mulps	%xmm7, %xmm7
00000000003b1c31	orps	%xmm6, %xmm10
00000000003b1c35	movaps	%xmm0, %xmm6
00000000003b1c38	shufps	$0x55, %xmm0, %xmm6             ## xmm6 = xmm6[1,1],xmm0[1,1]
00000000003b1c3c	mulps	%xmm7, %xmm6
00000000003b1c3f	mulps	%xmm9, %xmm13
00000000003b1c43	addps	%xmm5, %xmm13
00000000003b1c47	cvttps2dq	%xmm11, %xmm7
00000000003b1c4c	paddd	0x140(%r11), %xmm7
00000000003b1c55	pslld	$0x17, %xmm7
00000000003b1c5a	mulps	%xmm13, %xmm7
00000000003b1c5e	andps	%xmm3, %xmm7
00000000003b1c61	orps	%xmm4, %xmm7
00000000003b1c64	movaps	%xmm1, %xmm9
00000000003b1c68	shufps	$0xaa, %xmm1, %xmm9             ## xmm9 = xmm9[2,2],xmm1[2,2]
00000000003b1c6d	mulps	%xmm7, %xmm9
00000000003b1c71	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
00000000003b1c75	addps	%xmm9, %xmm1
00000000003b1c79	andps	%xmm3, %xmm1
00000000003b1c7c	orps	%xmm4, %xmm1
00000000003b1c7f	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
00000000003b1c83	cmpltps	%xmm10, %xmm0
00000000003b1c88	andps	%xmm3, %xmm5
00000000003b1c8b	andps	%xmm0, %xmm5
00000000003b1c8e	andnps	%xmm10, %xmm3
00000000003b1c92	orps	%xmm5, %xmm3
00000000003b1c95	movaps	%xmm3, %xmm0
00000000003b1c98	cmpleps	%xmm2, %xmm0
00000000003b1c9c	mulps	%xmm1, %xmm3
00000000003b1c9f	blendvps	%xmm0, %xmm6, %xmm1
00000000003b1ca4	andps	%xmm8, %xmm3
00000000003b1ca8	andnps	%xmm1, %xmm8
00000000003b1cac	orps	%xmm3, %xmm8
00000000003b1cb0	movaps	%xmm8, (%rdi,%r10)
00000000003b1cb5	addq	$0x10, %r10
00000000003b1cb9	cmpq	%r10, %rax
00000000003b1cbc	jne	0x3b1b50
00000000003b1cc2	incl	%r9d
00000000003b1cc5	addq	%rdx, %rsi
00000000003b1cc8	addq	%r8, %rdi
00000000003b1ccb	cmpl	%ecx, %r9d
00000000003b1cce	jne	0x3b1b40
00000000003b1cd4	jmp	0x3b1971
00000000003b1cd9	nopl	(%rax)
