__ZN18HgcBT2100_HLG_OETF10RenderTileEP6HGTile:
00000000003b0930	pushq	%rbp
00000000003b0931	movq	%rsp, %rbp
00000000003b0934	pushq	%r14
00000000003b0936	pushq	%rbx
00000000003b0937	subq	$0x10, %rsp
00000000003b093b	movq	%rsi, %r14
00000000003b093e	movq	%rdi, %rbx
00000000003b0941	movq	%rsi, %rdi
00000000003b0944	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000003b0949	movq	%rax, %rdi
00000000003b094c	xorl	%esi, %esi
00000000003b094e	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000003b0953	cmpl	$0x4700000, %eax                ## imm = 0x4700000
00000000003b0958	jb	0x3b0970
00000000003b095a	movq	%rbx, %rdi
00000000003b095d	movq	%r14, %rsi
00000000003b0960	callq	__ZN18HgcBT2100_HLG_OETF14RenderTile_AVXEP6HGTile ## HgcBT2100_HLG_OETF::RenderTile_AVX(HGTile*)
00000000003b0965	xorl	%eax, %eax
00000000003b0967	addq	$0x10, %rsp
00000000003b096b	popq	%rbx
00000000003b096c	popq	%r14
00000000003b096e	popq	%rbp
00000000003b096f	retq
00000000003b0970	movl	0x8(%r14), %r9d
00000000003b0974	subl	(%r14), %r9d
00000000003b0977	movl	0xc(%r14), %ecx
00000000003b097b	subl	0x4(%r14), %ecx
00000000003b097f	movslq	0x58(%r14), %rdx
00000000003b0983	movq	0x50(%r14), %rsi
00000000003b0987	movq	0x10(%r14), %rdi
00000000003b098b	movslq	0x18(%r14), %r8
00000000003b098f	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
00000000003b0994	jbe	0x3b0c00
00000000003b099a	testl	%ecx, %ecx
00000000003b099c	jle	0x3b0965
00000000003b099e	testl	%r9d, %r9d
00000000003b09a1	jle	0x3b0965
00000000003b09a3	movl	%r9d, %eax
00000000003b09a6	shlq	$0x4, %rdx
00000000003b09aa	shlq	$0x4, %r8
00000000003b09ae	shlq	$0x4, %rax
00000000003b09b2	xorl	%r9d, %r9d
00000000003b09b5	nopw	%cs:(%rax,%rax)
00000000003b09c0	xorl	%r10d, %r10d
00000000003b09c3	nopw	%cs:(%rax,%rax)
00000000003b09d0	movaps	(%rsi,%r10), %xmm1
00000000003b09d5	movq	0x198(%rbx), %r11
00000000003b09dc	movaps	(%r11), %xmm0
00000000003b09e0	movaps	0x20(%r11), %xmm2
00000000003b09e5	movaps	0x40(%r11), %xmm3
00000000003b09ea	movaps	0x60(%r11), %xmm5
00000000003b09ef	movaps	%xmm1, %xmm8
00000000003b09f3	maxps	%xmm3, %xmm8
00000000003b09f7	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
00000000003b09fb	movaps	%xmm1, %xmm6
00000000003b09fe	maxps	%xmm0, %xmm6
00000000003b0a01	movaps	%xmm2, %xmm4
00000000003b0a04	shufps	$0xaa, %xmm2, %xmm4             ## xmm4 = xmm4[2,2],xmm2[2,2]
00000000003b0a08	subps	%xmm4, %xmm6
00000000003b0a0b	movaps	%xmm8, %xmm9
00000000003b0a0f	maxps	%xmm5, %xmm9
00000000003b0a13	movaps	%xmm9, %xmm10
00000000003b0a17	rsqrtss	%xmm9, %xmm10
00000000003b0a1c	movaps	0x80(%r11), %xmm4
00000000003b0a24	mulss	%xmm4, %xmm10
00000000003b0a29	movaps	%xmm9, %xmm11
00000000003b0a2d	mulss	%xmm10, %xmm11
00000000003b0a32	mulss	%xmm10, %xmm11
00000000003b0a37	movaps	0x180(%r11), %xmm7
00000000003b0a3f	mulss	%xmm7, %xmm10
00000000003b0a44	movss	0xc0(%r11), %xmm12
00000000003b0a4d	subss	%xmm11, %xmm12
00000000003b0a52	mulss	%xmm10, %xmm12
00000000003b0a57	mulss	%xmm9, %xmm12
00000000003b0a5c	blendps	$0xe, %xmm8, %xmm12             ## xmm12 = xmm12[0],xmm8[1,2,3]
00000000003b0a63	movaps	%xmm12, %xmm8
00000000003b0a67	maxps	%xmm5, %xmm8
00000000003b0a6b	rsqrtps	%xmm8, %xmm9
00000000003b0a6f	mulps	%xmm4, %xmm9
00000000003b0a73	movaps	%xmm8, %xmm10
00000000003b0a77	mulps	%xmm9, %xmm10
00000000003b0a7b	mulps	%xmm9, %xmm10
00000000003b0a7f	mulps	%xmm7, %xmm9
00000000003b0a83	movaps	0xa0(%r11), %xmm11
00000000003b0a8b	movaps	%xmm11, %xmm13
00000000003b0a8f	subps	%xmm10, %xmm13
00000000003b0a93	mulps	%xmm9, %xmm13
00000000003b0a97	mulps	%xmm8, %xmm13
00000000003b0a9b	blendps	$0x3, %xmm12, %xmm13            ## xmm13 = xmm12[0,1],xmm13[2,3]
00000000003b0aa2	movaps	%xmm13, %xmm8
00000000003b0aa6	maxps	%xmm5, %xmm8
00000000003b0aaa	rsqrtps	%xmm8, %xmm9
00000000003b0aae	mulps	%xmm4, %xmm9
00000000003b0ab2	movaps	%xmm8, %xmm4
00000000003b0ab6	mulps	%xmm9, %xmm4
00000000003b0aba	mulps	%xmm9, %xmm4
00000000003b0abe	mulps	%xmm7, %xmm9
00000000003b0ac2	subps	%xmm4, %xmm11
00000000003b0ac6	mulps	%xmm9, %xmm11
00000000003b0aca	mulps	%xmm8, %xmm11
00000000003b0ace	blendps	$0xd, %xmm13, %xmm11            ## xmm11 = xmm13[0],xmm11[1],xmm13[2,3]
00000000003b0ad5	movaps	%xmm2, %xmm4
00000000003b0ad8	shufps	$0x0, %xmm2, %xmm4              ## xmm4 = xmm4[0,0],xmm2[0,0]
00000000003b0adc	mulps	%xmm11, %xmm4
00000000003b0ae0	movaps	0xe0(%r11), %xmm9
00000000003b0ae8	andps	%xmm6, %xmm9
00000000003b0aec	movaps	0x100(%r11), %xmm8
00000000003b0af4	movaps	%xmm6, %xmm10
00000000003b0af8	cmpltps	%xmm5, %xmm10
00000000003b0afd	andps	0x120(%r11), %xmm10
00000000003b0b05	psrld	$0x17, %xmm6
00000000003b0b0a	cvtdq2ps	%xmm6, %xmm5
00000000003b0b0d	subps	%xmm10, %xmm5
00000000003b0b11	subps	0x140(%r11), %xmm5
00000000003b0b19	orps	%xmm8, %xmm9
00000000003b0b1d	movaps	0x160(%r11), %xmm6
00000000003b0b25	cmpltps	%xmm9, %xmm6
00000000003b0b2a	andps	%xmm8, %xmm6
00000000003b0b2e	addps	%xmm6, %xmm5
00000000003b0b31	mulps	%xmm7, %xmm6
00000000003b0b34	mulps	%xmm9, %xmm6
00000000003b0b38	subps	%xmm8, %xmm9
00000000003b0b3c	subps	%xmm6, %xmm9
00000000003b0b40	movaps	%xmm9, %xmm6
00000000003b0b44	mulps	%xmm9, %xmm6
00000000003b0b48	movaps	0x1a0(%r11), %xmm7
00000000003b0b50	mulps	%xmm9, %xmm7
00000000003b0b54	addps	0x1c0(%r11), %xmm7
00000000003b0b5c	movaps	0x1e0(%r11), %xmm10
00000000003b0b64	mulps	%xmm9, %xmm10
00000000003b0b68	addps	0x200(%r11), %xmm10
00000000003b0b70	movaps	0x220(%r11), %xmm11
00000000003b0b78	mulps	%xmm9, %xmm11
00000000003b0b7c	addps	0x240(%r11), %xmm11
00000000003b0b84	mulps	%xmm6, %xmm10
00000000003b0b88	addps	%xmm7, %xmm10
00000000003b0b8c	mulps	%xmm6, %xmm10
00000000003b0b90	addps	%xmm11, %xmm10
00000000003b0b94	mulps	%xmm9, %xmm10
00000000003b0b98	addps	0x260(%r11), %xmm10
00000000003b0ba0	mulps	%xmm9, %xmm10
00000000003b0ba4	addps	%xmm5, %xmm10
00000000003b0ba8	movaps	%xmm2, %xmm5
00000000003b0bab	shufps	$0x55, %xmm2, %xmm5             ## xmm5 = xmm5[1,1],xmm2[1,1]
00000000003b0baf	mulps	%xmm10, %xmm5
00000000003b0bb3	shufps	$0xff, %xmm2, %xmm2             ## xmm2 = xmm2[3,3,3,3]
00000000003b0bb7	addps	%xmm5, %xmm2
00000000003b0bba	cmpltps	%xmm1, %xmm0
00000000003b0bbe	andps	%xmm8, %xmm0
00000000003b0bc2	blendps	$0x8, %xmm1, %xmm0              ## xmm0 = xmm0[0,1,2],xmm1[3]
00000000003b0bc8	cmpnleps	%xmm3, %xmm0
00000000003b0bcc	blendvps	%xmm0, %xmm2, %xmm4
00000000003b0bd1	blendps	$0x8, %xmm1, %xmm4              ## xmm4 = xmm4[0,1,2],xmm1[3]
00000000003b0bd7	movaps	%xmm4, (%rdi,%r10)
00000000003b0bdc	addq	$0x10, %r10
00000000003b0be0	cmpq	%r10, %rax
00000000003b0be3	jne	0x3b09d0
00000000003b0be9	incl	%r9d
00000000003b0bec	addq	%rdx, %rsi
00000000003b0bef	addq	%r8, %rdi
00000000003b0bf2	cmpl	%ecx, %r9d
00000000003b0bf5	jne	0x3b09c0
00000000003b0bfb	jmp	0x3b0965
00000000003b0c00	testl	%ecx, %ecx
00000000003b0c02	jle	0x3b0965
00000000003b0c08	testl	%r9d, %r9d
00000000003b0c0b	jle	0x3b0965
00000000003b0c11	movl	%r9d, %eax
00000000003b0c14	shlq	$0x4, %rdx
00000000003b0c18	shlq	$0x4, %r8
00000000003b0c1c	shlq	$0x4, %rax
00000000003b0c20	xorl	%r9d, %r9d
00000000003b0c23	nopw	%cs:(%rax,%rax)
00000000003b0c30	xorl	%r10d, %r10d
00000000003b0c33	nopw	%cs:(%rax,%rax)
00000000003b0c40	movaps	(%rsi,%r10), %xmm5
00000000003b0c45	movq	0x198(%rbx), %r11
00000000003b0c4c	movaps	(%r11), %xmm2
00000000003b0c50	movaps	0x20(%r11), %xmm1
00000000003b0c55	movaps	0x40(%r11), %xmm0
00000000003b0c5a	movaps	%xmm0, -0x20(%rbp)
00000000003b0c5e	movaps	0x60(%r11), %xmm3
00000000003b0c63	shufps	$0x0, %xmm2, %xmm2              ## xmm2 = xmm2[0,0,0,0]
00000000003b0c67	movaps	%xmm5, %xmm8
00000000003b0c6b	maxps	%xmm2, %xmm8
00000000003b0c6f	movaps	%xmm1, %xmm4
00000000003b0c72	shufps	$0xaa, %xmm1, %xmm4             ## xmm4 = xmm4[2,2],xmm1[2,2]
00000000003b0c76	subps	%xmm4, %xmm8
00000000003b0c7a	movaps	0x180(%r11), %xmm4
00000000003b0c82	movaps	0xe0(%r11), %xmm7
00000000003b0c8a	andps	%xmm8, %xmm7
00000000003b0c8e	movaps	0x100(%r11), %xmm6
00000000003b0c96	orps	%xmm6, %xmm7
00000000003b0c99	movaps	%xmm8, %xmm9
00000000003b0c9d	cmpltps	%xmm3, %xmm9
00000000003b0ca2	andps	0x120(%r11), %xmm9
00000000003b0caa	psrld	$0x17, %xmm8
00000000003b0cb0	cvtdq2ps	%xmm8, %xmm8
00000000003b0cb4	subps	%xmm9, %xmm8
00000000003b0cb8	subps	0x140(%r11), %xmm8
00000000003b0cc0	movaps	0x160(%r11), %xmm9
00000000003b0cc8	cmpltps	%xmm7, %xmm9
00000000003b0ccd	andps	%xmm6, %xmm9
00000000003b0cd1	addps	%xmm9, %xmm8
00000000003b0cd5	mulps	%xmm4, %xmm9
00000000003b0cd9	mulps	%xmm7, %xmm9
00000000003b0cdd	subps	%xmm6, %xmm7
00000000003b0ce0	cmpltps	%xmm5, %xmm2
00000000003b0ce4	movaps	0x280(%r11), %xmm10
00000000003b0cec	andps	%xmm10, %xmm6
00000000003b0cf0	andnps	%xmm5, %xmm10
00000000003b0cf4	maxps	%xmm0, %xmm5
00000000003b0cf7	movaps	%xmm5, %xmm11
00000000003b0cfb	maxps	%xmm3, %xmm11
00000000003b0cff	movaps	%xmm11, %xmm12
00000000003b0d03	rsqrtss	%xmm11, %xmm12
00000000003b0d08	movaps	0x80(%r11), %xmm13
00000000003b0d10	mulss	%xmm13, %xmm12
00000000003b0d15	movaps	%xmm11, %xmm14
00000000003b0d19	mulss	%xmm12, %xmm14
00000000003b0d1e	mulss	%xmm12, %xmm14
00000000003b0d23	mulss	%xmm4, %xmm12
00000000003b0d28	movss	0xc0(%r11), %xmm15
00000000003b0d31	subss	%xmm14, %xmm15
00000000003b0d36	mulss	%xmm12, %xmm15
00000000003b0d3b	mulss	%xmm11, %xmm15
00000000003b0d40	blendps	$0xe, %xmm5, %xmm15             ## xmm15 = xmm15[0],xmm5[1,2,3]
00000000003b0d47	movaps	%xmm15, %xmm5
00000000003b0d4b	maxps	%xmm3, %xmm5
00000000003b0d4e	rsqrtps	%xmm5, %xmm11
00000000003b0d52	mulps	%xmm13, %xmm11
00000000003b0d56	movaps	%xmm5, %xmm12
00000000003b0d5a	mulps	%xmm11, %xmm12
00000000003b0d5e	mulps	%xmm11, %xmm12
00000000003b0d62	movaps	0xa0(%r11), %xmm0
00000000003b0d6a	movaps	%xmm0, %xmm14
00000000003b0d6e	subps	%xmm12, %xmm14
00000000003b0d72	mulps	%xmm4, %xmm11
00000000003b0d76	mulps	%xmm11, %xmm14
00000000003b0d7a	mulps	%xmm5, %xmm14
00000000003b0d7e	blendps	$0x3, %xmm15, %xmm14            ## xmm14 = xmm15[0,1],xmm14[2,3]
00000000003b0d85	movaps	%xmm14, %xmm5
00000000003b0d89	maxps	%xmm3, %xmm5
00000000003b0d8c	rsqrtps	%xmm5, %xmm3
00000000003b0d8f	mulps	%xmm13, %xmm3
00000000003b0d93	movaps	%xmm5, %xmm11
00000000003b0d97	mulps	%xmm3, %xmm11
00000000003b0d9b	mulps	%xmm3, %xmm11
00000000003b0d9f	mulps	%xmm4, %xmm3
00000000003b0da2	subps	%xmm11, %xmm0
00000000003b0da6	mulps	%xmm3, %xmm0
00000000003b0da9	mulps	%xmm5, %xmm0
00000000003b0dac	blendps	$0xd, %xmm14, %xmm0             ## xmm0 = xmm14[0],xmm0[1],xmm14[2,3]
00000000003b0db3	movaps	%xmm1, %xmm3
00000000003b0db6	shufps	$0x0, %xmm1, %xmm3              ## xmm3 = xmm3[0,0],xmm1[0,0]
00000000003b0dba	mulps	%xmm0, %xmm3
00000000003b0dbd	subps	%xmm9, %xmm7
00000000003b0dc1	movaps	%xmm7, %xmm0
00000000003b0dc4	mulps	%xmm7, %xmm0
00000000003b0dc7	movaps	0x1a0(%r11), %xmm4
00000000003b0dcf	mulps	%xmm7, %xmm4
00000000003b0dd2	addps	0x1c0(%r11), %xmm4
00000000003b0dda	movaps	0x1e0(%r11), %xmm5
00000000003b0de2	mulps	%xmm7, %xmm5
00000000003b0de5	addps	0x200(%r11), %xmm5
00000000003b0ded	movaps	0x220(%r11), %xmm9
00000000003b0df5	mulps	%xmm7, %xmm9
00000000003b0df9	addps	0x240(%r11), %xmm9
00000000003b0e01	mulps	%xmm0, %xmm5
00000000003b0e04	addps	%xmm4, %xmm5
00000000003b0e07	mulps	%xmm0, %xmm5
00000000003b0e0a	addps	%xmm9, %xmm5
00000000003b0e0e	mulps	%xmm7, %xmm5
00000000003b0e11	addps	0x260(%r11), %xmm5
00000000003b0e19	mulps	%xmm7, %xmm5
00000000003b0e1c	addps	%xmm8, %xmm5
00000000003b0e20	movaps	%xmm1, %xmm0
00000000003b0e23	shufps	$0x55, %xmm1, %xmm0             ## xmm0 = xmm0[1,1],xmm1[1,1]
00000000003b0e27	mulps	%xmm5, %xmm0
00000000003b0e2a	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
00000000003b0e2e	addps	%xmm0, %xmm1
00000000003b0e31	andps	%xmm2, %xmm6
00000000003b0e34	orps	%xmm6, %xmm10
00000000003b0e38	movaps	%xmm10, %xmm0
00000000003b0e3c	cmpleps	-0x20(%rbp), %xmm0
00000000003b0e41	blendvps	%xmm0, %xmm3, %xmm1
00000000003b0e46	movaps	0x2a0(%r11), %xmm0
00000000003b0e4e	andps	%xmm0, %xmm10
00000000003b0e52	andnps	%xmm1, %xmm0
00000000003b0e55	orps	%xmm10, %xmm0
00000000003b0e59	movaps	%xmm0, (%rdi,%r10)
00000000003b0e5e	addq	$0x10, %r10
00000000003b0e62	cmpq	%r10, %rax
00000000003b0e65	jne	0x3b0c40
00000000003b0e6b	incl	%r9d
00000000003b0e6e	addq	%rdx, %rsi
00000000003b0e71	addq	%r8, %rdi
00000000003b0e74	cmpl	%ecx, %r9d
00000000003b0e77	jne	0x3b0c30
00000000003b0e7d	jmp	0x3b0965
00000000003b0e82	nopw	%cs:(%rax,%rax)
