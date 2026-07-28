__ZN17HgcColorIsolation10RenderTileEP6HGTile:
000000000145cb30	pushq	%rbp
000000000145cb31	movq	%rsp, %rbp
000000000145cb34	pushq	%r15
000000000145cb36	pushq	%r14
000000000145cb38	pushq	%r13
000000000145cb3a	pushq	%r12
000000000145cb3c	pushq	%rbx
000000000145cb3d	subq	$0x1b8, %rsp                    ## imm = 0x1B8
000000000145cb44	movq	%rsi, %rbx
000000000145cb47	movq	%rdi, %r14
000000000145cb4a	movq	%rsi, %rdi
000000000145cb4d	callq	0x1497218                       ## symbol stub for: __ZNK6HGTile8RendererEv
000000000145cb52	movq	%rax, %rdi
000000000145cb55	xorl	%esi, %esi
000000000145cb57	callq	0x1495ea4                       ## symbol stub for: __ZN10HGRenderer9GetTargetEj
000000000145cb5c	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000145cb61	jb	0x145cb82
000000000145cb63	movq	%r14, %rdi
000000000145cb66	movq	%rbx, %rsi
000000000145cb69	callq	__ZN17HgcColorIsolation14RenderTile_AVXEP6HGTile ## HgcColorIsolation::RenderTile_AVX(HGTile*)
000000000145cb6e	xorl	%eax, %eax
000000000145cb70	addq	$0x1b8, %rsp                    ## imm = 0x1B8
000000000145cb77	popq	%rbx
000000000145cb78	popq	%r12
000000000145cb7a	popq	%r13
000000000145cb7c	popq	%r14
000000000145cb7e	popq	%r15
000000000145cb80	popq	%rbp
000000000145cb81	retq
000000000145cb82	movl	%eax, %r15d
000000000145cb85	movq	%rbx, %rdi
000000000145cb88	callq	0x1497218                       ## symbol stub for: __ZNK6HGTile8RendererEv
000000000145cb8d	movq	(%r14), %rcx
000000000145cb90	movq	%r14, %rdi
000000000145cb93	movq	%rax, %rsi
000000000145cb96	callq	*0x138(%rcx)
000000000145cb9c	movl	0x8(%rbx), %r9d
000000000145cba0	movl	0xc(%rbx), %ecx
000000000145cba3	subl	(%rbx), %r9d
000000000145cba6	subl	0x4(%rbx), %ecx
000000000145cba9	movl	0xe8(%rbx), %esi
000000000145cbaf	subl	0xe0(%rbx), %esi
000000000145cbb5	movslq	0x58(%rbx), %rdx
000000000145cbb9	cvtsi2ss	%esi, %xmm0
000000000145cbbd	movss	%xmm0, -0x2c(%rbp)
000000000145cbc2	movq	0x50(%rbx), %rsi
000000000145cbc6	movq	0x10(%rbx), %rdi
000000000145cbca	movslq	0x18(%rbx), %r8
000000000145cbce	cmpl	$0x44fffff, %r15d               ## imm = 0x44FFFFF
000000000145cbd5	jbe	0x145d620
000000000145cbdb	testl	%ecx, %ecx
000000000145cbdd	jle	0x145cb6e
000000000145cbdf	testl	%r9d, %r9d
000000000145cbe2	jle	0x145cb6e
000000000145cbe4	movss	0x110374(%rip), %xmm0
000000000145cbec	movss	-0x2c(%rbp), %xmm1
000000000145cbf1	addss	%xmm0, %xmm1
000000000145cbf5	movaps	%xmm1, -0x110(%rbp)
000000000145cbfc	addss	%xmm0, %xmm1
000000000145cc00	movaps	%xmm1, -0x160(%rbp)
000000000145cc07	movl	%r9d, %r9d
000000000145cc0a	shlq	$0x4, %rdx
000000000145cc0e	shlq	$0x4, %r8
000000000145cc12	shlq	$0x4, %r9
000000000145cc16	xorl	%r10d, %r10d
000000000145cc19	jmp	0x145cc32
000000000145cc1b	nopl	(%rax,%rax)
000000000145cc20	incl	%r10d
000000000145cc23	addq	%rdx, %rsi
000000000145cc26	addq	%r8, %rdi
000000000145cc29	cmpl	%ecx, %r10d
000000000145cc2c	je	0x145cb6e
000000000145cc32	xorl	%r11d, %r11d
000000000145cc35	jmp	0x145cc7e
000000000145cc37	nopw	(%rax,%rax)
000000000145cc40	xorps	%xmm0, %xmm0
000000000145cc43	maxss	%xmm0, %xmm1
000000000145cc47	minss	-0x110(%rbp), %xmm1
000000000145cc4f	cvttss2si	%xmm1, %r12d
000000000145cc54	movq	0x60(%rbx), %r13
000000000145cc58	movslq	%r12d, %r12
000000000145cc5b	shlq	$0x4, %r12
000000000145cc5f	movaps	(%r13,%r12), %xmm0
000000000145cc65	andps	0x3c0(%r15), %xmm0
000000000145cc6d	orps	%xmm3, %xmm0
000000000145cc70	movaps	%xmm0, (%rdi,%r11)
000000000145cc75	addq	$0x10, %r11
000000000145cc79	cmpq	%r11, %r9
000000000145cc7c	je	0x145cc20
000000000145cc7e	movaps	(%rsi,%r11), %xmm1
000000000145cc83	movq	0x198(%r14), %r15
000000000145cc8a	maxps	0x120(%r15), %xmm1
000000000145cc92	movaps	0x3a0(%r15), %xmm12
000000000145cc9a	minps	%xmm12, %xmm1
000000000145cc9e	insertps	$0x30, %xmm12, %xmm1            ## xmm1 = xmm1[0,1,2],xmm12[0]
000000000145cca5	movaps	(%r15), %xmm2
000000000145cca9	dpps	$0xff, %xmm1, %xmm2
000000000145ccaf	movaps	0x20(%r15), %xmm7
000000000145ccb4	dpps	$0xff, %xmm1, %xmm7
000000000145ccba	movaps	0x40(%r15), %xmm4
000000000145ccbf	dpps	$0xff, %xmm1, %xmm4
000000000145ccc5	movaps	0x180(%r15), %xmm15
000000000145cccd	movaps	0x1a0(%r15), %xmm3
000000000145ccd5	movaps	%xmm3, -0xb0(%rbp)
000000000145ccdc	andps	%xmm15, %xmm2
000000000145cce0	movaps	%xmm15, -0x100(%rbp)
000000000145cce8	movaps	%xmm2, %xmm0
000000000145cceb	andps	%xmm3, %xmm0
000000000145ccee	orps	%xmm12, %xmm0
000000000145ccf2	movaps	0x1c0(%r15), %xmm14
000000000145ccfa	movaps	%xmm2, %xmm5
000000000145ccfd	cmpltps	%xmm14, %xmm5
000000000145cd02	movaps	0x1e0(%r15), %xmm10
000000000145cd0a	andps	%xmm10, %xmm5
000000000145cd0e	movaps	%xmm10, -0x50(%rbp)
000000000145cd13	psrld	$0x17, %xmm2
000000000145cd18	cvtdq2ps	%xmm2, %xmm3
000000000145cd1b	subps	%xmm5, %xmm3
000000000145cd1e	movaps	0x200(%r15), %xmm2
000000000145cd26	movaps	%xmm2, -0x40(%rbp)
000000000145cd2a	subps	%xmm2, %xmm3
000000000145cd2d	movss	0x220(%r15), %xmm5
000000000145cd36	movaps	%xmm5, %xmm2
000000000145cd39	cmpltss	%xmm0, %xmm2
000000000145cd3e	andps	%xmm12, %xmm2
000000000145cd42	addps	%xmm2, %xmm3
000000000145cd45	movaps	0x240(%r15), %xmm11
000000000145cd4d	mulps	%xmm11, %xmm2
000000000145cd51	movaps	%xmm11, -0x70(%rbp)
000000000145cd56	mulps	%xmm0, %xmm2
000000000145cd59	movaps	%xmm0, %xmm8
000000000145cd5d	subps	%xmm12, %xmm8
000000000145cd61	subps	%xmm2, %xmm8
000000000145cd65	movaps	%xmm8, %xmm2
000000000145cd69	mulps	%xmm8, %xmm2
000000000145cd6d	movaps	0x260(%r15), %xmm9
000000000145cd75	movaps	%xmm9, -0x80(%rbp)
000000000145cd7a	mulps	%xmm8, %xmm9
000000000145cd7e	movaps	0x280(%r15), %xmm13
000000000145cd86	addps	%xmm13, %xmm9
000000000145cd8a	movaps	%xmm13, -0xc0(%rbp)
000000000145cd92	mulps	%xmm2, %xmm9
000000000145cd96	movaps	0x2a0(%r15), %xmm2
000000000145cd9e	movaps	%xmm2, -0x60(%rbp)
000000000145cda2	mulps	%xmm8, %xmm2
000000000145cda6	movaps	0x2c0(%r15), %xmm6
000000000145cdae	movaps	%xmm6, -0xa0(%rbp)
000000000145cdb5	addps	%xmm6, %xmm2
000000000145cdb8	addps	%xmm9, %xmm2
000000000145cdbc	mulps	%xmm8, %xmm2
000000000145cdc0	addps	%xmm3, %xmm2
000000000145cdc3	andps	%xmm15, %xmm7
000000000145cdc7	movaps	%xmm7, %xmm3
000000000145cdca	cmpltps	%xmm14, %xmm3
000000000145cdcf	movaps	%xmm14, %xmm15
000000000145cdd3	movaps	%xmm14, -0x90(%rbp)
000000000145cddb	andps	%xmm10, %xmm3
000000000145cddf	movaps	%xmm7, %xmm8
000000000145cde3	psrld	$0x17, %xmm7
000000000145cde8	cvtdq2ps	%xmm7, %xmm7
000000000145cdeb	subps	%xmm3, %xmm7
000000000145cdee	movaps	-0xb0(%rbp), %xmm6
000000000145cdf5	andps	%xmm6, %xmm8
000000000145cdf9	orps	%xmm12, %xmm8
000000000145cdfd	subps	-0x40(%rbp), %xmm7
000000000145ce01	movaps	%xmm5, %xmm3
000000000145ce04	cmpltss	%xmm8, %xmm3
000000000145ce0a	andps	%xmm12, %xmm3
000000000145ce0e	addps	%xmm3, %xmm7
000000000145ce11	mulps	%xmm11, %xmm3
000000000145ce15	mulps	%xmm8, %xmm3
000000000145ce19	movaps	%xmm8, %xmm9
000000000145ce1d	subps	%xmm12, %xmm9
000000000145ce21	subps	%xmm3, %xmm9
000000000145ce25	movaps	%xmm9, %xmm3
000000000145ce29	mulps	%xmm9, %xmm3
000000000145ce2d	movaps	-0x80(%rbp), %xmm11
000000000145ce32	movaps	%xmm11, %xmm10
000000000145ce36	mulps	%xmm9, %xmm10
000000000145ce3a	addps	%xmm13, %xmm10
000000000145ce3e	mulps	%xmm3, %xmm10
000000000145ce42	movaps	-0x60(%rbp), %xmm13
000000000145ce47	movaps	%xmm13, %xmm3
000000000145ce4b	mulps	%xmm9, %xmm3
000000000145ce4f	movaps	-0xa0(%rbp), %xmm14
000000000145ce57	addps	%xmm14, %xmm3
000000000145ce5b	addps	%xmm10, %xmm3
000000000145ce5f	mulps	%xmm9, %xmm3
000000000145ce63	addps	%xmm7, %xmm3
000000000145ce66	movaps	0xc0(%r15), %xmm7
000000000145ce6e	movaps	%xmm7, -0x150(%rbp)
000000000145ce75	mulps	%xmm7, %xmm3
000000000145ce78	blendps	$0xe, %xmm8, %xmm3              ## xmm3 = xmm3[0],xmm8[1,2,3]
000000000145ce7f	movaps	0x2e0(%r15), %xmm10
000000000145ce87	maxss	%xmm10, %xmm3
000000000145ce8c	roundss	$0x9, %xmm3, %xmm8
000000000145ce93	subss	%xmm8, %xmm3
000000000145ce98	movaps	0x300(%r15), %xmm7
000000000145cea0	movaps	%xmm7, -0xe0(%rbp)
000000000145cea7	mulss	%xmm3, %xmm7
000000000145ceab	movaps	0x320(%r15), %xmm9
000000000145ceb3	movaps	%xmm9, -0xd0(%rbp)
000000000145cebb	addss	%xmm9, %xmm7
000000000145cec0	mulss	%xmm3, %xmm7
000000000145cec4	movaps	0x340(%r15), %xmm9
000000000145cecc	movaps	%xmm9, -0x140(%rbp)
000000000145ced4	addss	%xmm9, %xmm7
000000000145ced9	mulss	%xmm3, %xmm7
000000000145cedd	cvttps2dq	%xmm8, %xmm3
000000000145cee2	movdqa	0x360(%r15), %xmm8
000000000145ceeb	movdqa	%xmm8, -0x120(%rbp)
000000000145cef4	paddd	%xmm8, %xmm3
000000000145cef9	pslld	$0x17, %xmm3
000000000145cefe	addss	%xmm12, %xmm7
000000000145cf03	mulss	%xmm3, %xmm7
000000000145cf07	andps	-0x100(%rbp), %xmm4
000000000145cf0e	movaps	%xmm4, %xmm9
000000000145cf12	cmpltps	%xmm15, %xmm9
000000000145cf17	andps	-0x50(%rbp), %xmm9
000000000145cf1c	movaps	%xmm4, %xmm8
000000000145cf20	psrld	$0x17, %xmm4
000000000145cf25	cvtdq2ps	%xmm4, %xmm3
000000000145cf28	subps	%xmm9, %xmm3
000000000145cf2c	andps	%xmm6, %xmm8
000000000145cf30	orps	%xmm12, %xmm8
000000000145cf34	subps	-0x40(%rbp), %xmm3
000000000145cf38	cmpltss	%xmm8, %xmm5
000000000145cf3e	andps	%xmm12, %xmm5
000000000145cf42	movaps	%xmm12, -0xf0(%rbp)
000000000145cf4a	addps	%xmm5, %xmm3
000000000145cf4d	movaps	-0x70(%rbp), %xmm15
000000000145cf52	mulps	%xmm15, %xmm5
000000000145cf56	mulps	%xmm8, %xmm5
000000000145cf5a	movaps	%xmm8, %xmm9
000000000145cf5e	subps	%xmm12, %xmm9
000000000145cf62	subps	%xmm5, %xmm9
000000000145cf66	movaps	%xmm9, %xmm4
000000000145cf6a	mulps	%xmm9, %xmm4
000000000145cf6e	mulps	%xmm9, %xmm11
000000000145cf72	movaps	-0xc0(%rbp), %xmm12
000000000145cf7a	addps	%xmm12, %xmm11
000000000145cf7e	mulps	%xmm4, %xmm11
000000000145cf82	movaps	%xmm13, %xmm4
000000000145cf86	mulps	%xmm9, %xmm4
000000000145cf8a	addps	%xmm14, %xmm4
000000000145cf8e	addps	%xmm11, %xmm4
000000000145cf92	mulps	%xmm9, %xmm4
000000000145cf96	addps	%xmm3, %xmm4
000000000145cf99	movaps	-0x150(%rbp), %xmm11
000000000145cfa1	mulps	%xmm11, %xmm2
000000000145cfa5	blendps	$0xe, %xmm0, %xmm2              ## xmm2 = xmm2[0],xmm0[1,2,3]
000000000145cfab	movaps	%xmm10, -0x1a0(%rbp)
000000000145cfb3	maxss	%xmm10, %xmm2
000000000145cfb8	roundss	$0x9, %xmm2, %xmm0
000000000145cfbe	cvttps2dq	%xmm0, %xmm3
000000000145cfc2	movdqa	-0x120(%rbp), %xmm6
000000000145cfca	paddd	%xmm6, %xmm3
000000000145cfce	pslld	$0x17, %xmm3
000000000145cfd3	mulps	%xmm11, %xmm4
000000000145cfd7	blendps	$0xe, %xmm8, %xmm4              ## xmm4 = xmm4[0],xmm8[1,2,3]
000000000145cfde	maxss	%xmm10, %xmm4
000000000145cfe3	roundss	$0x9, %xmm4, %xmm8
000000000145cfea	cvttps2dq	%xmm8, %xmm5
000000000145cfef	paddd	%xmm6, %xmm5
000000000145cff3	pslld	$0x17, %xmm5
000000000145cff8	punpckldq	%xmm5, %xmm3            ## xmm3 = xmm3[0],xmm5[0],xmm3[1],xmm5[1]
000000000145cffc	insertps	$0x1c, %xmm4, %xmm2             ## xmm2 = xmm2[0],xmm4[0],zero,zero
000000000145d002	insertps	$0x1c, %xmm8, %xmm0             ## xmm0 = xmm0[0],xmm8[0],zero,zero
000000000145d009	subps	%xmm0, %xmm2
000000000145d00c	movsldup	-0xe0(%rbp), %xmm0              ## xmm0 = mem[0,0,2,2]
000000000145d014	movaps	%xmm0, -0x1b0(%rbp)
000000000145d01b	movaps	%xmm2, %xmm4
000000000145d01e	mulps	%xmm0, %xmm4
000000000145d021	movsldup	-0xd0(%rbp), %xmm0              ## xmm0 = mem[0,0,2,2]
000000000145d029	movaps	%xmm0, -0x1e0(%rbp)
000000000145d030	addps	%xmm0, %xmm4
000000000145d033	mulps	%xmm2, %xmm4
000000000145d036	movsldup	-0x140(%rbp), %xmm0             ## xmm0 = mem[0,0,2,2]
000000000145d03e	movaps	%xmm0, -0x1d0(%rbp)
000000000145d045	addps	%xmm0, %xmm4
000000000145d048	mulps	%xmm2, %xmm4
000000000145d04b	movaps	0x60(%r15), %xmm10
000000000145d050	dpps	$0xff, %xmm1, %xmm10
000000000145d057	movaps	-0xf0(%rbp), %xmm14
000000000145d05f	movsldup	%xmm14, %xmm0                   ## xmm0 = xmm14[0,0,2,2]
000000000145d064	movaps	%xmm0, -0x1c0(%rbp)
000000000145d06b	addps	%xmm0, %xmm4
000000000145d06e	mulps	%xmm3, %xmm4
000000000145d071	addss	%xmm4, %xmm7
000000000145d075	movshdup	%xmm4, %xmm2                    ## xmm2 = xmm4[1,1,3,3]
000000000145d079	addss	%xmm7, %xmm2
000000000145d07d	shufps	$0x0, %xmm2, %xmm2              ## xmm2 = xmm2[0,0,0,0]
000000000145d081	movaps	-0xb0(%rbp), %xmm11
000000000145d089	movaps	%xmm11, %xmm3
000000000145d08d	andps	%xmm2, %xmm3
000000000145d090	movaps	%xmm2, %xmm4
000000000145d093	movaps	-0x90(%rbp), %xmm9
000000000145d09b	cmpltps	%xmm9, %xmm4
000000000145d0a0	movaps	-0x50(%rbp), %xmm13
000000000145d0a5	andps	%xmm13, %xmm4
000000000145d0a9	psrld	$0x17, %xmm2
000000000145d0ae	cvtdq2ps	%xmm2, %xmm5
000000000145d0b1	subps	%xmm4, %xmm5
000000000145d0b4	movaps	0x140(%r15), %xmm2
000000000145d0bc	movaps	%xmm2, -0x130(%rbp)
000000000145d0c3	orps	%xmm2, %xmm3
000000000145d0c6	movaps	-0x40(%rbp), %xmm0
000000000145d0ca	subps	%xmm0, %xmm5
000000000145d0cd	movaps	0x220(%r15), %xmm4
000000000145d0d5	movaps	%xmm4, %xmm7
000000000145d0d8	movaps	%xmm4, %xmm6
000000000145d0db	movaps	%xmm4, -0x190(%rbp)
000000000145d0e2	cmpltps	%xmm3, %xmm7
000000000145d0e6	andps	%xmm2, %xmm7
000000000145d0e9	addps	%xmm7, %xmm5
000000000145d0ec	mulps	%xmm15, %xmm7
000000000145d0f0	mulps	%xmm3, %xmm7
000000000145d0f3	subps	%xmm2, %xmm3
000000000145d0f6	subps	%xmm7, %xmm3
000000000145d0f9	movaps	%xmm3, %xmm7
000000000145d0fc	mulps	%xmm3, %xmm7
000000000145d0ff	movaps	-0x80(%rbp), %xmm15
000000000145d104	movaps	%xmm15, %xmm8
000000000145d108	mulps	%xmm3, %xmm8
000000000145d10c	addps	%xmm12, %xmm8
000000000145d110	mulps	%xmm7, %xmm8
000000000145d114	movaps	-0x60(%rbp), %xmm7
000000000145d118	mulps	%xmm3, %xmm7
000000000145d11b	movaps	-0xa0(%rbp), %xmm12
000000000145d123	addps	%xmm12, %xmm7
000000000145d127	addps	%xmm8, %xmm7
000000000145d12b	mulps	%xmm3, %xmm7
000000000145d12e	addps	%xmm5, %xmm7
000000000145d131	movaps	-0x100(%rbp), %xmm4
000000000145d138	andps	%xmm4, %xmm10
000000000145d13c	movaps	%xmm10, %xmm2
000000000145d140	andps	%xmm11, %xmm2
000000000145d144	movaps	%xmm14, %xmm11
000000000145d148	orps	%xmm14, %xmm2
000000000145d14c	movaps	%xmm2, %xmm5
000000000145d14f	movaps	%xmm10, %xmm2
000000000145d153	cmpltps	%xmm9, %xmm2
000000000145d158	andps	%xmm13, %xmm2
000000000145d15c	movaps	%xmm2, -0x180(%rbp)
000000000145d163	psrld	$0x17, %xmm10
000000000145d169	cvtdq2ps	%xmm10, %xmm3
000000000145d16d	subps	%xmm2, %xmm3
000000000145d170	subps	%xmm0, %xmm3
000000000145d173	xorps	%xmm14, %xmm14
000000000145d177	blendps	$0x1, %xmm6, %xmm14             ## xmm14 = xmm6[0],xmm14[1,2,3]
000000000145d17e	movaps	%xmm14, %xmm8
000000000145d182	movaps	%xmm5, %xmm9
000000000145d186	movaps	%xmm5, -0x170(%rbp)
000000000145d18d	cmpltss	%xmm5, %xmm8
000000000145d193	movaps	%xmm11, %xmm6
000000000145d197	andps	%xmm11, %xmm8
000000000145d19b	addps	%xmm8, %xmm3
000000000145d19f	movaps	-0x70(%rbp), %xmm0
000000000145d1a3	mulps	%xmm0, %xmm8
000000000145d1a7	mulps	%xmm5, %xmm8
000000000145d1ab	subps	%xmm11, %xmm9
000000000145d1af	subps	%xmm8, %xmm9
000000000145d1b3	movaps	%xmm9, %xmm8
000000000145d1b7	mulps	%xmm9, %xmm8
000000000145d1bb	movaps	%xmm15, %xmm5
000000000145d1bf	movaps	%xmm15, %xmm10
000000000145d1c3	mulps	%xmm9, %xmm10
000000000145d1c7	addps	-0xc0(%rbp), %xmm10
000000000145d1cf	mulps	%xmm8, %xmm10
000000000145d1d3	movaps	-0x60(%rbp), %xmm2
000000000145d1d7	movaps	%xmm2, %xmm11
000000000145d1db	mulps	%xmm9, %xmm11
000000000145d1df	addps	%xmm12, %xmm11
000000000145d1e3	addps	%xmm10, %xmm11
000000000145d1e7	movaps	0x80(%r15), %xmm8
000000000145d1ef	dpps	$0xff, %xmm1, %xmm8
000000000145d1f6	mulps	%xmm9, %xmm11
000000000145d1fa	addps	%xmm3, %xmm11
000000000145d1fe	andps	%xmm4, %xmm8
000000000145d202	movaps	%xmm8, %xmm13
000000000145d206	movaps	-0xb0(%rbp), %xmm10
000000000145d20e	andps	%xmm10, %xmm13
000000000145d212	orps	%xmm6, %xmm13
000000000145d216	movaps	%xmm8, %xmm15
000000000145d21a	cmpltps	-0x90(%rbp), %xmm15
000000000145d223	andps	-0x50(%rbp), %xmm15
000000000145d228	psrld	$0x17, %xmm8
000000000145d22e	cvtdq2ps	%xmm8, %xmm3
000000000145d232	subps	%xmm15, %xmm3
000000000145d236	subps	-0x40(%rbp), %xmm3
000000000145d23a	movaps	%xmm14, %xmm8
000000000145d23e	cmpltss	%xmm13, %xmm8
000000000145d244	andps	%xmm6, %xmm8
000000000145d248	addps	%xmm8, %xmm3
000000000145d24c	mulps	%xmm0, %xmm8
000000000145d250	mulps	%xmm13, %xmm8
000000000145d254	movaps	%xmm13, %xmm9
000000000145d258	subps	%xmm6, %xmm9
000000000145d25c	subps	%xmm8, %xmm9
000000000145d260	movaps	%xmm9, %xmm8
000000000145d264	mulps	%xmm9, %xmm8
000000000145d268	movaps	%xmm5, %xmm0
000000000145d26b	mulps	%xmm9, %xmm0
000000000145d26f	movaps	-0xc0(%rbp), %xmm5
000000000145d276	addps	%xmm5, %xmm0
000000000145d279	mulps	%xmm8, %xmm0
000000000145d27d	movaps	%xmm2, %xmm12
000000000145d281	movaps	%xmm2, %xmm6
000000000145d284	mulps	%xmm9, %xmm12
000000000145d288	movaps	-0xa0(%rbp), %xmm4
000000000145d28f	addps	%xmm4, %xmm12
000000000145d293	addps	%xmm0, %xmm12
000000000145d297	mulps	%xmm9, %xmm12
000000000145d29b	addps	%xmm3, %xmm12
000000000145d29f	dpps	$0xff, 0xa0(%r15), %xmm1
000000000145d2aa	andps	-0x100(%rbp), %xmm1
000000000145d2b1	movaps	%xmm1, %xmm8
000000000145d2b5	andps	%xmm10, %xmm8
000000000145d2b9	movaps	-0xf0(%rbp), %xmm2
000000000145d2c0	orps	%xmm2, %xmm8
000000000145d2c4	movaps	%xmm1, %xmm9
000000000145d2c8	cmpltps	-0x90(%rbp), %xmm9
000000000145d2d1	andps	-0x50(%rbp), %xmm9
000000000145d2d6	psrld	$0x17, %xmm1
000000000145d2db	cvtdq2ps	%xmm1, %xmm1
000000000145d2de	subps	%xmm9, %xmm1
000000000145d2e2	subps	-0x40(%rbp), %xmm1
000000000145d2e6	cmpltss	%xmm8, %xmm14
000000000145d2ec	andps	%xmm2, %xmm14
000000000145d2f0	addps	%xmm14, %xmm1
000000000145d2f4	mulps	-0x70(%rbp), %xmm14
000000000145d2f9	mulps	%xmm8, %xmm14
000000000145d2fd	movaps	%xmm8, %xmm0
000000000145d301	subps	%xmm2, %xmm0
000000000145d304	subps	%xmm14, %xmm0
000000000145d308	movaps	%xmm0, %xmm3
000000000145d30b	mulps	%xmm0, %xmm3
000000000145d30e	movaps	-0x80(%rbp), %xmm14
000000000145d313	mulps	%xmm0, %xmm14
000000000145d317	addps	%xmm5, %xmm14
000000000145d31b	mulps	%xmm3, %xmm14
000000000145d31f	movaps	%xmm6, %xmm3
000000000145d322	mulps	%xmm0, %xmm3
000000000145d325	addps	%xmm4, %xmm3
000000000145d328	addps	%xmm14, %xmm3
000000000145d32c	mulps	%xmm0, %xmm3
000000000145d32f	addps	%xmm1, %xmm3
000000000145d332	movaps	-0x150(%rbp), %xmm14
000000000145d33a	mulps	%xmm14, %xmm11
000000000145d33e	mulps	%xmm14, %xmm12
000000000145d342	mulps	%xmm14, %xmm3
000000000145d346	shufps	$0x55, %xmm14, %xmm14           ## xmm14 = xmm14[1,1,1,1]
000000000145d34b	mulps	%xmm14, %xmm7
000000000145d34f	movaps	-0x1a0(%rbp), %xmm10
000000000145d357	maxps	%xmm10, %xmm7
000000000145d35b	roundps	$0x9, %xmm7, %xmm1
000000000145d361	subps	%xmm1, %xmm7
000000000145d364	movaps	-0xe0(%rbp), %xmm2
000000000145d36b	movaps	%xmm2, %xmm0
000000000145d36e	mulps	%xmm7, %xmm0
000000000145d371	movaps	-0xd0(%rbp), %xmm4
000000000145d378	addps	%xmm4, %xmm0
000000000145d37b	mulps	%xmm7, %xmm0
000000000145d37e	movaps	-0x140(%rbp), %xmm5
000000000145d385	addps	%xmm5, %xmm0
000000000145d388	mulps	%xmm7, %xmm0
000000000145d38b	addps	-0x130(%rbp), %xmm0
000000000145d392	cvttps2dq	%xmm1, %xmm1
000000000145d396	movdqa	-0x120(%rbp), %xmm6
000000000145d39e	paddd	%xmm6, %xmm1
000000000145d3a2	pslld	$0x17, %xmm1
000000000145d3a7	mulps	%xmm0, %xmm1
000000000145d3aa	blendps	$0xe, -0x170(%rbp), %xmm11      ## xmm11 = xmm11[0],mem[1,2,3]
000000000145d3b5	blendps	$0xe, %xmm13, %xmm12            ## xmm12 = xmm12[0],xmm13[1,2,3]
000000000145d3bc	maxss	%xmm10, %xmm12
000000000145d3c1	roundss	$0x9, %xmm12, %xmm15
000000000145d3c8	subss	%xmm15, %xmm12
000000000145d3cd	movaps	%xmm2, %xmm7
000000000145d3d0	mulss	%xmm12, %xmm7
000000000145d3d5	addss	%xmm4, %xmm7
000000000145d3d9	mulss	%xmm12, %xmm7
000000000145d3de	addss	%xmm5, %xmm7
000000000145d3e2	movaps	%xmm5, %xmm13
000000000145d3e6	mulss	%xmm12, %xmm7
000000000145d3eb	cvttps2dq	%xmm15, %xmm0
000000000145d3f0	paddd	%xmm6, %xmm0
000000000145d3f4	pslld	$0x17, %xmm0
000000000145d3f9	movaps	-0xf0(%rbp), %xmm4
000000000145d400	addss	%xmm4, %xmm7
000000000145d404	mulss	%xmm0, %xmm7
000000000145d408	blendps	$0xe, %xmm8, %xmm3              ## xmm3 = xmm3[0],xmm8[1,2,3]
000000000145d40f	maxss	%xmm10, %xmm11
000000000145d414	movaps	-0x180(%rbp), %xmm0
000000000145d41b	roundss	$0x9, %xmm11, %xmm0
000000000145d422	cvttps2dq	%xmm0, %xmm8
000000000145d427	movaps	%xmm0, %xmm2
000000000145d42a	paddd	%xmm6, %xmm8
000000000145d42f	pslld	$0x17, %xmm8
000000000145d435	maxss	%xmm10, %xmm3
000000000145d43a	roundss	$0x9, %xmm3, %xmm9
000000000145d441	cvttps2dq	%xmm9, %xmm0
000000000145d446	paddd	%xmm6, %xmm0
000000000145d44a	movdqa	%xmm6, %xmm12
000000000145d44f	pslld	$0x17, %xmm0
000000000145d454	punpckldq	%xmm0, %xmm8            ## xmm8 = xmm8[0],xmm0[0],xmm8[1],xmm0[1]
000000000145d459	insertps	$0x1c, %xmm3, %xmm11            ## xmm11 = xmm11[0],xmm3[0],zero,zero
000000000145d460	movaps	%xmm4, %xmm3
000000000145d463	insertps	$0x1c, %xmm9, %xmm2             ## xmm2 = xmm2[0],xmm9[0],zero,zero
000000000145d46a	subps	%xmm2, %xmm11
000000000145d46e	movaps	-0x1b0(%rbp), %xmm0
000000000145d475	mulps	%xmm11, %xmm0
000000000145d479	addps	-0x1e0(%rbp), %xmm0
000000000145d480	mulps	%xmm11, %xmm0
000000000145d484	addps	-0x1d0(%rbp), %xmm0
000000000145d48b	mulps	%xmm11, %xmm0
000000000145d48f	addps	-0x1c0(%rbp), %xmm0
000000000145d496	mulps	%xmm8, %xmm0
000000000145d49a	addss	%xmm0, %xmm7
000000000145d49e	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
000000000145d4a2	addss	%xmm7, %xmm0
000000000145d4a6	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000145d4aa	movaps	%xmm0, %xmm2
000000000145d4ad	cmpltps	-0x90(%rbp), %xmm2
000000000145d4b5	andps	-0x50(%rbp), %xmm2
000000000145d4b9	movaps	-0xb0(%rbp), %xmm5
000000000145d4c0	andps	%xmm0, %xmm5
000000000145d4c3	psrld	$0x17, %xmm0
000000000145d4c8	cvtdq2ps	%xmm0, %xmm0
000000000145d4cb	subps	%xmm2, %xmm0
000000000145d4ce	subps	-0x40(%rbp), %xmm0
000000000145d4d2	movaps	-0x130(%rbp), %xmm7
000000000145d4d9	orps	%xmm7, %xmm5
000000000145d4dc	movaps	-0x190(%rbp), %xmm2
000000000145d4e3	cmpltps	%xmm5, %xmm2
000000000145d4e7	andps	%xmm7, %xmm2
000000000145d4ea	addps	%xmm2, %xmm0
000000000145d4ed	mulps	-0x70(%rbp), %xmm2
000000000145d4f1	mulps	%xmm5, %xmm2
000000000145d4f4	subps	%xmm7, %xmm5
000000000145d4f7	subps	%xmm2, %xmm5
000000000145d4fa	movaps	-0x80(%rbp), %xmm4
000000000145d4fe	mulps	%xmm5, %xmm4
000000000145d501	addps	-0xc0(%rbp), %xmm4
000000000145d508	movaps	%xmm5, %xmm2
000000000145d50b	mulps	%xmm5, %xmm2
000000000145d50e	mulps	%xmm2, %xmm4
000000000145d511	movaps	-0x60(%rbp), %xmm6
000000000145d515	mulps	%xmm5, %xmm6
000000000145d518	addps	-0xa0(%rbp), %xmm6
000000000145d51f	addps	%xmm4, %xmm6
000000000145d522	mulps	%xmm5, %xmm6
000000000145d525	addps	%xmm0, %xmm6
000000000145d528	mulps	%xmm14, %xmm6
000000000145d52c	maxps	%xmm10, %xmm6
000000000145d530	roundps	$0x9, %xmm6, %xmm0
000000000145d536	subps	%xmm0, %xmm6
000000000145d539	movaps	-0xe0(%rbp), %xmm2
000000000145d540	mulps	%xmm6, %xmm2
000000000145d543	addps	-0xd0(%rbp), %xmm2
000000000145d54a	mulps	%xmm6, %xmm2
000000000145d54d	addps	%xmm13, %xmm2
000000000145d551	mulps	%xmm6, %xmm2
000000000145d554	cvttps2dq	%xmm0, %xmm0
000000000145d558	paddd	%xmm12, %xmm0
000000000145d55d	addps	%xmm7, %xmm2
000000000145d560	pslld	$0x17, %xmm0
000000000145d565	mulps	%xmm2, %xmm0
000000000145d568	movaps	%xmm1, %xmm2
000000000145d56b	subps	%xmm7, %xmm2
000000000145d56e	mulps	%xmm0, %xmm2
000000000145d571	subps	%xmm0, %xmm1
000000000145d574	rcpss	%xmm1, %xmm1
000000000145d578	mulss	0x380(%r15), %xmm1
000000000145d581	shufps	$0x0, %xmm1, %xmm1              ## xmm1 = xmm1[0,0,0,0]
000000000145d585	mulps	%xmm2, %xmm1
000000000145d588	maxps	%xmm3, %xmm1
000000000145d58b	minps	%xmm7, %xmm1
000000000145d58e	movaps	%xmm7, %xmm0
000000000145d591	subps	%xmm1, %xmm0
000000000145d594	mulps	0x100(%r15), %xmm0
000000000145d59c	addps	0xe0(%r15), %xmm0
000000000145d5a4	maxps	%xmm3, %xmm0
000000000145d5a7	minps	%xmm7, %xmm0
000000000145d5aa	shufps	$0xff, %xmm0, %xmm0             ## xmm0 = xmm0[3,3,3,3]
000000000145d5ae	movaps	%xmm0, %xmm1
000000000145d5b1	mulss	-0x2c(%rbp), %xmm1
000000000145d5b6	testl	%eax, %eax
000000000145d5b8	je	0x145cc40
000000000145d5be	addss	0x10f9a6(%rip), %xmm1
000000000145d5c6	blendps	$0x1, %xmm1, %xmm0              ## xmm0 = xmm1[0],xmm0[1,2,3]
000000000145d5cc	xorps	%xmm1, %xmm1
000000000145d5cf	maxss	%xmm1, %xmm0
000000000145d5d3	minss	-0x110(%rbp), %xmm0
000000000145d5db	movaps	%xmm0, %xmm1
000000000145d5de	minss	-0x160(%rbp), %xmm1
000000000145d5e6	cvttss2si	%xmm1, %r12d
000000000145d5eb	movq	0x60(%rbx), %r13
000000000145d5ef	movslq	%r12d, %r12
000000000145d5f2	xorps	%xmm1, %xmm1
000000000145d5f5	cvtsi2ss	%r12d, %xmm1
000000000145d5fa	shlq	$0x4, %r12
000000000145d5fe	subss	%xmm1, %xmm0
000000000145d602	movaps	(%r13,%r12), %xmm1
000000000145d608	movaps	0x10(%r13,%r12), %xmm2
000000000145d60e	subps	%xmm1, %xmm2
000000000145d611	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000145d615	mulps	%xmm2, %xmm0
000000000145d618	addps	%xmm1, %xmm0
000000000145d61b	jmp	0x145cc65
000000000145d620	testl	%ecx, %ecx
000000000145d622	jle	0x145cb6e
000000000145d628	testl	%r9d, %r9d
000000000145d62b	jle	0x145cb6e
000000000145d631	movss	0x10f927(%rip), %xmm0
000000000145d639	movss	-0x2c(%rbp), %xmm1
000000000145d63e	addss	%xmm0, %xmm1
000000000145d642	movaps	%xmm1, -0x110(%rbp)
000000000145d649	addss	%xmm0, %xmm1
000000000145d64d	movaps	%xmm1, -0x160(%rbp)
000000000145d654	movl	%r9d, %r9d
000000000145d657	shlq	$0x4, %rdx
000000000145d65b	shlq	$0x4, %r8
000000000145d65f	shlq	$0x4, %r9
000000000145d663	xorl	%r10d, %r10d
000000000145d666	jmp	0x145d682
000000000145d668	nopl	(%rax,%rax)
000000000145d670	incl	%r10d
000000000145d673	addq	%rdx, %rsi
000000000145d676	addq	%r8, %rdi
000000000145d679	cmpl	%ecx, %r10d
000000000145d67c	je	0x145cb6e
000000000145d682	xorl	%r11d, %r11d
000000000145d685	jmp	0x145d6cf
000000000145d687	nopw	(%rax,%rax)
000000000145d690	xorps	%xmm1, %xmm1
000000000145d693	maxss	%xmm1, %xmm0
000000000145d697	minss	-0x110(%rbp), %xmm0
000000000145d69f	cvttss2si	%xmm0, %r12d
000000000145d6a4	movq	0x60(%rbx), %r13
000000000145d6a8	movslq	%r12d, %r12
000000000145d6ab	shlq	$0x4, %r12
000000000145d6af	movaps	(%r13,%r12), %xmm1
000000000145d6b5	andps	0x3c0(%r15), %xmm1
000000000145d6bd	orps	%xmm13, %xmm1
000000000145d6c1	movaps	%xmm1, (%rdi,%r11)
000000000145d6c6	addq	$0x10, %r11
000000000145d6ca	cmpq	%r11, %r9
000000000145d6cd	je	0x145d670
000000000145d6cf	movaps	(%rsi,%r11), %xmm3
000000000145d6d4	movq	0x198(%r14), %r15
000000000145d6db	movaps	0x120(%r15), %xmm0
000000000145d6e3	movaps	0x180(%r15), %xmm15
000000000145d6eb	maxps	%xmm0, %xmm3
000000000145d6ee	movaps	0x3a0(%r15), %xmm9
000000000145d6f6	minps	%xmm9, %xmm3
000000000145d6fa	andps	0x160(%r15), %xmm3
000000000145d702	orps	%xmm0, %xmm3
000000000145d705	movaps	(%r15), %xmm0
000000000145d709	mulps	%xmm3, %xmm0
000000000145d70c	movaps	%xmm0, %xmm2
000000000145d70f	shufps	$0x39, %xmm0, %xmm2             ## xmm2 = xmm2[1,2],xmm0[3,0]
000000000145d713	addps	%xmm0, %xmm2
000000000145d716	movaps	%xmm2, %xmm0
000000000145d719	unpckhpd	%xmm2, %xmm0                    ## xmm0 = xmm0[1],xmm2[1]
000000000145d71d	addss	%xmm0, %xmm2
000000000145d721	movaps	0x20(%r15), %xmm0
000000000145d726	mulps	%xmm3, %xmm0
000000000145d729	movaps	%xmm0, %xmm7
000000000145d72c	shufps	$0x39, %xmm0, %xmm7             ## xmm7 = xmm7[1,2],xmm0[3,0]
000000000145d730	addps	%xmm0, %xmm7
000000000145d733	movaps	%xmm7, %xmm0
000000000145d736	unpckhpd	%xmm7, %xmm0                    ## xmm0 = xmm0[1],xmm7[1]
000000000145d73a	addss	%xmm0, %xmm7
000000000145d73e	movaps	0x40(%r15), %xmm0
000000000145d743	mulps	%xmm3, %xmm0
000000000145d746	movaps	%xmm0, %xmm1
000000000145d749	shufps	$0x39, %xmm0, %xmm1             ## xmm1 = xmm1[1,2],xmm0[3,0]
000000000145d74d	addps	%xmm0, %xmm1
000000000145d750	movaps	%xmm1, %xmm0
000000000145d753	unpckhpd	%xmm1, %xmm0                    ## xmm0 = xmm0[1],xmm1[1]
000000000145d757	addss	%xmm0, %xmm1
000000000145d75b	movaps	0x60(%r15), %xmm0
000000000145d760	mulps	%xmm3, %xmm0
000000000145d763	movaps	%xmm0, %xmm10
000000000145d767	shufps	$0x39, %xmm0, %xmm10            ## xmm10 = xmm10[1,2],xmm0[3,0]
000000000145d76c	addps	%xmm0, %xmm10
000000000145d770	movaps	%xmm10, %xmm0
000000000145d774	unpckhpd	%xmm10, %xmm0                   ## xmm0 = xmm0[1],xmm10[1]
000000000145d779	addss	%xmm0, %xmm10
000000000145d77e	movaps	0x80(%r15), %xmm4
000000000145d786	mulps	%xmm3, %xmm4
000000000145d789	movaps	%xmm4, %xmm0
000000000145d78c	shufps	$0x39, %xmm4, %xmm0             ## xmm0 = xmm0[1,2],xmm4[3,0]
000000000145d790	addps	%xmm4, %xmm0
000000000145d793	movaps	%xmm0, %xmm4
000000000145d796	unpckhpd	%xmm0, %xmm4                    ## xmm4 = xmm4[1],xmm0[1]
000000000145d79a	mulps	0xa0(%r15), %xmm3
000000000145d7a2	addss	%xmm4, %xmm0
000000000145d7a6	movaps	%xmm0, -0x170(%rbp)
000000000145d7ad	movaps	%xmm3, %xmm0
000000000145d7b0	shufps	$0x39, %xmm3, %xmm0             ## xmm0 = xmm0[1,2],xmm3[3,0]
000000000145d7b4	addps	%xmm3, %xmm0
000000000145d7b7	movaps	%xmm0, %xmm3
000000000145d7ba	unpckhpd	%xmm0, %xmm3                    ## xmm3 = xmm3[1],xmm0[1]
000000000145d7be	addss	%xmm3, %xmm0
000000000145d7c2	movaps	%xmm0, -0x150(%rbp)
000000000145d7c9	andps	%xmm15, %xmm2
000000000145d7cd	movaps	%xmm15, -0xa0(%rbp)
000000000145d7d5	movaps	0x1a0(%r15), %xmm0
000000000145d7dd	movaps	%xmm0, -0xe0(%rbp)
000000000145d7e4	movaps	%xmm2, %xmm4
000000000145d7e7	andps	%xmm0, %xmm4
000000000145d7ea	orps	%xmm9, %xmm4
000000000145d7ee	movaps	0x1c0(%r15), %xmm14
000000000145d7f6	movaps	%xmm2, %xmm3
000000000145d7f9	cmpltps	%xmm14, %xmm3
000000000145d7fe	movaps	%xmm14, -0x50(%rbp)
000000000145d803	movaps	0x1e0(%r15), %xmm0
000000000145d80b	movaps	%xmm0, -0x40(%rbp)
000000000145d80f	andps	%xmm0, %xmm3
000000000145d812	psrld	$0x17, %xmm2
000000000145d817	cvtdq2ps	%xmm2, %xmm11
000000000145d81b	subps	%xmm3, %xmm11
000000000145d81f	movaps	0x200(%r15), %xmm0
000000000145d827	movaps	%xmm0, -0x60(%rbp)
000000000145d82b	subps	%xmm0, %xmm11
000000000145d82f	movss	0x220(%r15), %xmm5
000000000145d838	movaps	%xmm5, %xmm2
000000000145d83b	cmpltss	%xmm4, %xmm2
000000000145d840	andps	%xmm9, %xmm2
000000000145d844	addps	%xmm2, %xmm11
000000000145d848	movaps	0x240(%r15), %xmm0
000000000145d850	movaps	%xmm0, -0x90(%rbp)
000000000145d857	mulps	%xmm0, %xmm2
000000000145d85a	mulps	%xmm4, %xmm2
000000000145d85d	movaps	%xmm4, %xmm12
000000000145d861	subps	%xmm9, %xmm12
000000000145d865	subps	%xmm2, %xmm12
000000000145d869	movaps	%xmm12, %xmm2
000000000145d86d	mulps	%xmm12, %xmm2
000000000145d871	movaps	0x260(%r15), %xmm13
000000000145d879	movaps	%xmm13, -0x80(%rbp)
000000000145d87e	mulps	%xmm12, %xmm13
000000000145d882	movaps	0x280(%r15), %xmm8
000000000145d88a	addps	%xmm8, %xmm13
000000000145d88e	movaps	%xmm8, -0x70(%rbp)
000000000145d893	mulps	%xmm2, %xmm13
000000000145d897	movaps	0x2a0(%r15), %xmm2
000000000145d89f	movaps	%xmm2, %xmm3
000000000145d8a2	mulps	%xmm12, %xmm3
000000000145d8a6	movaps	0x2c0(%r15), %xmm6
000000000145d8ae	addps	%xmm6, %xmm3
000000000145d8b1	addps	%xmm13, %xmm3
000000000145d8b5	mulps	%xmm12, %xmm3
000000000145d8b9	addps	%xmm11, %xmm3
000000000145d8bd	movaps	0xc0(%r15), %xmm0
000000000145d8c5	movaps	%xmm0, -0xf0(%rbp)
000000000145d8cc	mulps	%xmm0, %xmm3
000000000145d8cf	blendps	$0xe, %xmm4, %xmm3              ## xmm3 = xmm3[0],xmm4[1,2,3]
000000000145d8d5	andps	%xmm15, %xmm7
000000000145d8d9	movaps	%xmm7, %xmm12
000000000145d8dd	cmpltps	%xmm14, %xmm12
000000000145d8e2	movaps	-0x40(%rbp), %xmm15
000000000145d8e7	andps	%xmm15, %xmm12
000000000145d8eb	movaps	%xmm7, %xmm4
000000000145d8ee	psrld	$0x17, %xmm7
000000000145d8f3	cvtdq2ps	%xmm7, %xmm11
000000000145d8f7	subps	%xmm12, %xmm11
000000000145d8fb	andps	-0xe0(%rbp), %xmm4
000000000145d902	movaps	%xmm9, -0xd0(%rbp)
000000000145d90a	orps	%xmm9, %xmm4
000000000145d90e	movaps	-0x60(%rbp), %xmm14
000000000145d913	subps	%xmm14, %xmm11
000000000145d917	movaps	%xmm5, %xmm7
000000000145d91a	cmpltss	%xmm4, %xmm7
000000000145d91f	andps	%xmm9, %xmm7
000000000145d923	addps	%xmm7, %xmm11
000000000145d927	movaps	-0x90(%rbp), %xmm0
000000000145d92e	mulps	%xmm0, %xmm7
000000000145d931	mulps	%xmm4, %xmm7
000000000145d934	movaps	%xmm4, %xmm12
000000000145d938	subps	%xmm9, %xmm12
000000000145d93c	subps	%xmm7, %xmm12
000000000145d940	movaps	%xmm12, %xmm7
000000000145d944	mulps	%xmm12, %xmm7
000000000145d948	movaps	-0x80(%rbp), %xmm9
000000000145d94d	movaps	%xmm9, %xmm13
000000000145d951	mulps	%xmm12, %xmm13
000000000145d955	addps	%xmm8, %xmm13
000000000145d959	mulps	%xmm7, %xmm13
000000000145d95d	movaps	%xmm2, %xmm7
000000000145d960	mulps	%xmm12, %xmm7
000000000145d964	addps	%xmm6, %xmm7
000000000145d967	movaps	%xmm6, %xmm8
000000000145d96b	addps	%xmm13, %xmm7
000000000145d96f	mulps	%xmm12, %xmm7
000000000145d973	addps	%xmm11, %xmm7
000000000145d977	movaps	-0xf0(%rbp), %xmm6
000000000145d97e	mulps	%xmm6, %xmm7
000000000145d981	blendps	$0xe, %xmm4, %xmm7              ## xmm7 = xmm7[0],xmm4[1,2,3]
000000000145d987	movaps	0x2e0(%r15), %xmm13
000000000145d98f	maxss	%xmm13, %xmm7
000000000145d994	cvtps2dq	%xmm7, %xmm4
000000000145d998	cvtdq2ps	%xmm4, %xmm4
000000000145d99b	movaps	%xmm7, %xmm11
000000000145d99f	cmpltss	%xmm4, %xmm11
000000000145d9a5	cvtdq2ps	%xmm11, %xmm11
000000000145d9a9	movaps	%xmm11, %xmm12
000000000145d9ad	addss	%xmm4, %xmm12
000000000145d9b2	addss	%xmm11, %xmm4
000000000145d9b7	subss	%xmm12, %xmm7
000000000145d9bc	movaps	0x300(%r15), %xmm11
000000000145d9c4	movaps	%xmm11, -0x100(%rbp)
000000000145d9cc	mulss	%xmm7, %xmm11
000000000145d9d1	movaps	0x320(%r15), %xmm12
000000000145d9d9	movaps	%xmm12, -0xc0(%rbp)
000000000145d9e1	addss	%xmm12, %xmm11
000000000145d9e6	mulss	%xmm7, %xmm11
000000000145d9eb	movaps	0x340(%r15), %xmm12
000000000145d9f3	movaps	%xmm12, -0xb0(%rbp)
000000000145d9fb	addss	%xmm12, %xmm11
000000000145da00	mulss	%xmm7, %xmm11
000000000145da05	movaps	-0xd0(%rbp), %xmm12
000000000145da0d	addss	%xmm12, %xmm11
000000000145da12	cvttps2dq	%xmm4, %xmm7
000000000145da16	movdqa	0x360(%r15), %xmm4
000000000145da1f	movdqa	%xmm4, -0x130(%rbp)
000000000145da27	paddd	%xmm4, %xmm7
000000000145da2b	pslld	$0x17, %xmm7
000000000145da30	mulss	%xmm11, %xmm7
000000000145da35	andps	-0xa0(%rbp), %xmm1
000000000145da3c	movaps	%xmm1, %xmm11
000000000145da40	cmpltps	-0x50(%rbp), %xmm11
000000000145da46	andps	%xmm15, %xmm11
000000000145da4a	movaps	%xmm1, %xmm4
000000000145da4d	psrld	$0x17, %xmm1
000000000145da52	cvtdq2ps	%xmm1, %xmm1
000000000145da55	subps	%xmm11, %xmm1
000000000145da59	movaps	-0xe0(%rbp), %xmm15
000000000145da61	andps	%xmm15, %xmm4
000000000145da65	orps	%xmm12, %xmm4
000000000145da69	subps	%xmm14, %xmm1
000000000145da6d	cmpltss	%xmm4, %xmm5
000000000145da72	andps	%xmm12, %xmm5
000000000145da76	addps	%xmm5, %xmm1
000000000145da79	mulps	%xmm0, %xmm5
000000000145da7c	mulps	%xmm4, %xmm5
000000000145da7f	movaps	%xmm4, %xmm11
000000000145da83	subps	%xmm12, %xmm11
000000000145da87	movaps	%xmm12, %xmm0
000000000145da8b	subps	%xmm5, %xmm11
000000000145da8f	movaps	%xmm11, %xmm5
000000000145da93	mulps	%xmm11, %xmm5
000000000145da97	movaps	%xmm9, %xmm12
000000000145da9b	mulps	%xmm11, %xmm12
000000000145da9f	movaps	-0x70(%rbp), %xmm14
000000000145daa4	addps	%xmm14, %xmm12
000000000145daa8	mulps	%xmm5, %xmm12
000000000145daac	movaps	%xmm2, %xmm5
000000000145daaf	mulps	%xmm11, %xmm5
000000000145dab3	addps	%xmm8, %xmm5
000000000145dab7	addps	%xmm12, %xmm5
000000000145dabb	mulps	%xmm11, %xmm5
000000000145dabf	addps	%xmm1, %xmm5
000000000145dac2	mulps	%xmm6, %xmm5
000000000145dac5	blendps	$0xe, %xmm4, %xmm5              ## xmm5 = xmm5[0],xmm4[1,2,3]
000000000145dacb	movaps	%xmm13, -0x1b0(%rbp)
000000000145dad3	maxss	%xmm13, %xmm3
000000000145dad8	cvtps2dq	%xmm3, %xmm1
000000000145dadc	cvtdq2ps	%xmm1, %xmm1
000000000145dadf	movaps	%xmm3, %xmm11
000000000145dae3	cmpltss	%xmm1, %xmm11
000000000145dae9	maxss	%xmm13, %xmm5
000000000145daee	cvtps2dq	%xmm5, %xmm4
000000000145daf2	cvtdq2ps	%xmm4, %xmm4
000000000145daf5	insertps	$0x1c, %xmm5, %xmm3             ## xmm3 = xmm3[0],xmm5[0],zero,zero
000000000145dafb	cmpltss	%xmm4, %xmm5
000000000145db00	insertps	$0x1c, %xmm5, %xmm11            ## xmm11 = xmm11[0],xmm5[0],zero,zero
000000000145db07	cvtdq2ps	%xmm11, %xmm5
000000000145db0b	movaps	%xmm1, %xmm11
000000000145db0f	insertps	$0x1c, %xmm4, %xmm11            ## xmm11 = xmm11[0],xmm4[0],zero,zero
000000000145db16	addps	%xmm5, %xmm11
000000000145db1a	blendps	$0x1, %xmm11, %xmm1             ## xmm1 = xmm11[0],xmm1[1,2,3]
000000000145db21	insertps	$0x40, %xmm11, %xmm4            ## xmm4 = xmm11[1],xmm4[1,2,3]
000000000145db28	subps	%xmm11, %xmm3
000000000145db2c	movsldup	-0x100(%rbp), %xmm11            ## xmm11 = mem[0,0,2,2]
000000000145db35	movaps	%xmm11, -0x140(%rbp)
000000000145db3d	mulps	%xmm3, %xmm11
000000000145db41	movsldup	-0xc0(%rbp), %xmm5              ## xmm5 = mem[0,0,2,2]
000000000145db49	movaps	%xmm5, -0x1e0(%rbp)
000000000145db50	addps	%xmm5, %xmm11
000000000145db54	mulps	%xmm3, %xmm11
000000000145db58	movsldup	-0xb0(%rbp), %xmm5              ## xmm5 = mem[0,0,2,2]
000000000145db60	movaps	%xmm5, -0x1d0(%rbp)
000000000145db67	addps	%xmm5, %xmm11
000000000145db6b	mulps	%xmm3, %xmm11
000000000145db6f	cvttps2dq	%xmm1, %xmm1
000000000145db73	movdqa	-0x130(%rbp), %xmm5
000000000145db7b	paddd	%xmm5, %xmm1
000000000145db7f	pslld	$0x17, %xmm1
000000000145db84	cvttps2dq	%xmm4, %xmm3
000000000145db88	paddd	%xmm5, %xmm3
000000000145db8c	pslld	$0x17, %xmm3
000000000145db91	punpckldq	%xmm3, %xmm1            ## xmm1 = xmm1[0],xmm3[0],xmm1[1],xmm3[1]
000000000145db95	movsldup	%xmm0, %xmm3                    ## xmm3 = xmm0[0,0,2,2]
000000000145db99	movaps	%xmm3, -0x1c0(%rbp)
000000000145dba0	addps	%xmm3, %xmm11
000000000145dba4	mulps	%xmm11, %xmm1
000000000145dba8	addss	%xmm1, %xmm7
000000000145dbac	movshdup	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1,3,3]
000000000145dbb0	addss	%xmm7, %xmm1
000000000145dbb4	shufps	$0x0, %xmm1, %xmm1              ## xmm1 = xmm1[0,0,0,0]
000000000145dbb8	movaps	%xmm15, %xmm5
000000000145dbbc	movaps	%xmm15, %xmm4
000000000145dbc0	andps	%xmm1, %xmm4
000000000145dbc3	movaps	%xmm1, %xmm3
000000000145dbc6	movaps	-0x50(%rbp), %xmm9
000000000145dbcb	cmpltps	%xmm9, %xmm3
000000000145dbd0	movaps	-0x40(%rbp), %xmm15
000000000145dbd5	andps	%xmm15, %xmm3
000000000145dbd9	psrld	$0x17, %xmm1
000000000145dbde	cvtdq2ps	%xmm1, %xmm11
000000000145dbe2	subps	%xmm3, %xmm11
000000000145dbe6	movaps	0x140(%r15), %xmm1
000000000145dbee	movaps	%xmm1, -0x120(%rbp)
000000000145dbf5	orps	%xmm1, %xmm4
000000000145dbf8	movaps	-0x60(%rbp), %xmm13
000000000145dbfd	subps	%xmm13, %xmm11
000000000145dc01	movaps	0x220(%r15), %xmm3
000000000145dc09	movaps	%xmm3, %xmm7
000000000145dc0c	movaps	%xmm3, -0x1a0(%rbp)
000000000145dc13	cmpltps	%xmm4, %xmm7
000000000145dc17	andps	%xmm1, %xmm7
000000000145dc1a	addps	%xmm7, %xmm11
000000000145dc1e	mulps	-0x90(%rbp), %xmm7
000000000145dc25	mulps	%xmm4, %xmm7
000000000145dc28	subps	%xmm1, %xmm4
000000000145dc2b	subps	%xmm7, %xmm4
000000000145dc2e	movaps	%xmm4, %xmm7
000000000145dc31	mulps	%xmm4, %xmm7
000000000145dc34	movaps	-0x80(%rbp), %xmm6
000000000145dc38	movaps	%xmm6, %xmm12
000000000145dc3c	mulps	%xmm4, %xmm12
000000000145dc40	addps	%xmm14, %xmm12
000000000145dc44	mulps	%xmm7, %xmm12
000000000145dc48	movaps	%xmm2, %xmm7
000000000145dc4b	mulps	%xmm4, %xmm7
000000000145dc4e	addps	%xmm8, %xmm7
000000000145dc52	addps	%xmm12, %xmm7
000000000145dc56	mulps	%xmm4, %xmm7
000000000145dc59	addps	%xmm11, %xmm7
000000000145dc5d	movaps	-0xa0(%rbp), %xmm1
000000000145dc64	andps	%xmm1, %xmm10
000000000145dc68	movaps	%xmm10, %xmm11
000000000145dc6c	cmpltps	%xmm9, %xmm11
000000000145dc71	andps	%xmm15, %xmm11
000000000145dc75	movaps	%xmm10, %xmm12
000000000145dc79	psrld	$0x17, %xmm10
000000000145dc7f	cvtdq2ps	%xmm10, %xmm4
000000000145dc83	subps	%xmm11, %xmm4
000000000145dc87	movaps	%xmm12, %xmm11
000000000145dc8b	andps	%xmm5, %xmm11
000000000145dc8f	movaps	-0xd0(%rbp), %xmm12
000000000145dc97	orps	%xmm12, %xmm11
000000000145dc9b	subps	%xmm13, %xmm4
000000000145dc9f	xorps	%xmm14, %xmm14
000000000145dca3	blendps	$0x1, %xmm3, %xmm14             ## xmm14 = xmm3[0],xmm14[1,2,3]
000000000145dcaa	movaps	%xmm14, %xmm10
000000000145dcae	cmpltss	%xmm11, %xmm10
000000000145dcb4	movaps	%xmm11, -0x190(%rbp)
000000000145dcbc	andps	%xmm12, %xmm10
000000000145dcc0	addps	%xmm10, %xmm4
000000000145dcc4	movaps	-0x90(%rbp), %xmm13
000000000145dccc	mulps	%xmm13, %xmm10
000000000145dcd0	mulps	%xmm11, %xmm10
000000000145dcd4	subps	%xmm12, %xmm11
000000000145dcd8	movaps	%xmm12, %xmm3
000000000145dcdc	subps	%xmm10, %xmm11
000000000145dce0	movaps	%xmm11, %xmm10
000000000145dce4	mulps	%xmm11, %xmm10
000000000145dce8	movaps	%xmm6, %xmm12
000000000145dcec	mulps	%xmm11, %xmm12
000000000145dcf0	addps	-0x70(%rbp), %xmm12
000000000145dcf5	mulps	%xmm10, %xmm12
000000000145dcf9	movaps	%xmm2, %xmm10
000000000145dcfd	mulps	%xmm11, %xmm10
000000000145dd01	addps	%xmm8, %xmm10
000000000145dd05	movaps	%xmm8, %xmm6
000000000145dd09	addps	%xmm12, %xmm10
000000000145dd0d	mulps	%xmm11, %xmm10
000000000145dd11	addps	%xmm4, %xmm10
000000000145dd15	movaps	-0x170(%rbp), %xmm0
000000000145dd1c	andps	%xmm1, %xmm0
000000000145dd1f	movaps	%xmm0, %xmm4
000000000145dd22	cmpltps	%xmm9, %xmm4
000000000145dd27	andps	%xmm15, %xmm4
000000000145dd2b	movaps	%xmm0, %xmm9
000000000145dd2f	psrld	$0x17, %xmm0
000000000145dd34	cvtdq2ps	%xmm0, %xmm0
000000000145dd37	subps	%xmm4, %xmm0
000000000145dd3a	andps	%xmm5, %xmm9
000000000145dd3e	orps	%xmm3, %xmm9
000000000145dd42	movaps	-0x60(%rbp), %xmm15
000000000145dd47	subps	%xmm15, %xmm0
000000000145dd4b	movaps	%xmm14, %xmm4
000000000145dd4f	cmpltss	%xmm9, %xmm4
000000000145dd55	andps	%xmm3, %xmm4
000000000145dd58	addps	%xmm4, %xmm0
000000000145dd5b	mulps	%xmm13, %xmm4
000000000145dd5f	mulps	%xmm9, %xmm4
000000000145dd63	movaps	%xmm9, %xmm12
000000000145dd67	subps	%xmm3, %xmm12
000000000145dd6b	movaps	%xmm3, %xmm8
000000000145dd6f	subps	%xmm4, %xmm12
000000000145dd73	movaps	%xmm12, %xmm11
000000000145dd77	mulps	%xmm12, %xmm11
000000000145dd7b	movaps	-0x80(%rbp), %xmm3
000000000145dd7f	movaps	%xmm3, %xmm4
000000000145dd82	mulps	%xmm12, %xmm4
000000000145dd86	movaps	-0x70(%rbp), %xmm1
000000000145dd8a	addps	%xmm1, %xmm4
000000000145dd8d	mulps	%xmm11, %xmm4
000000000145dd91	movaps	%xmm2, %xmm11
000000000145dd95	mulps	%xmm12, %xmm11
000000000145dd99	addps	%xmm6, %xmm11
000000000145dd9d	movaps	%xmm6, -0x180(%rbp)
000000000145dda4	addps	%xmm4, %xmm11
000000000145dda8	mulps	%xmm12, %xmm11
000000000145ddac	addps	%xmm0, %xmm11
000000000145ddb0	movaps	-0x150(%rbp), %xmm0
000000000145ddb7	andps	-0xa0(%rbp), %xmm0
000000000145ddbe	movaps	%xmm0, %xmm12
000000000145ddc2	cmpltps	-0x50(%rbp), %xmm12
000000000145ddc8	andps	-0x40(%rbp), %xmm12
000000000145ddcd	movaps	%xmm0, %xmm4
000000000145ddd0	psrld	$0x17, %xmm0
000000000145ddd5	cvtdq2ps	%xmm0, %xmm0
000000000145ddd8	subps	%xmm12, %xmm0
000000000145dddc	andps	%xmm5, %xmm4
000000000145dddf	movaps	%xmm8, %xmm5
000000000145dde3	orps	%xmm8, %xmm4
000000000145dde7	subps	%xmm15, %xmm0
000000000145ddeb	cmpltss	%xmm4, %xmm14
000000000145ddf1	andps	%xmm8, %xmm14
000000000145ddf5	addps	%xmm14, %xmm0
000000000145ddf9	mulps	%xmm13, %xmm14
000000000145ddfd	mulps	%xmm4, %xmm14
000000000145de01	movaps	%xmm4, %xmm8
000000000145de05	subps	%xmm5, %xmm8
000000000145de09	subps	%xmm14, %xmm8
000000000145de0d	movaps	%xmm8, %xmm14
000000000145de11	mulps	%xmm8, %xmm14
000000000145de15	movaps	%xmm3, %xmm12
000000000145de19	mulps	%xmm8, %xmm12
000000000145de1d	addps	%xmm1, %xmm12
000000000145de21	mulps	%xmm14, %xmm12
000000000145de25	movaps	%xmm2, %xmm14
000000000145de29	mulps	%xmm8, %xmm14
000000000145de2d	addps	%xmm6, %xmm14
000000000145de31	addps	%xmm12, %xmm14
000000000145de35	mulps	%xmm8, %xmm14
000000000145de39	addps	%xmm0, %xmm14
000000000145de3d	movaps	-0xf0(%rbp), %xmm8
000000000145de45	mulps	%xmm8, %xmm10
000000000145de49	mulps	%xmm8, %xmm11
000000000145de4d	mulps	%xmm8, %xmm14
000000000145de51	shufps	$0x55, %xmm8, %xmm8             ## xmm8 = xmm8[1,1,1,1]
000000000145de56	mulps	%xmm8, %xmm7
000000000145de5a	movaps	-0x1b0(%rbp), %xmm5
000000000145de61	maxps	%xmm5, %xmm7
000000000145de64	cvtps2dq	%xmm7, %xmm0
000000000145de68	cvtdq2ps	%xmm0, %xmm0
000000000145de6b	movaps	%xmm7, %xmm12
000000000145de6f	cmpltps	%xmm0, %xmm12
000000000145de74	cvtdq2ps	%xmm12, %xmm12
000000000145de78	addps	%xmm0, %xmm12
000000000145de7c	subps	%xmm12, %xmm7
000000000145de80	movaps	-0x100(%rbp), %xmm13
000000000145de88	movaps	%xmm13, %xmm15
000000000145de8c	mulps	%xmm7, %xmm15
000000000145de90	movaps	-0xc0(%rbp), %xmm1
000000000145de97	addps	%xmm1, %xmm15
000000000145de9b	mulps	%xmm7, %xmm15
000000000145de9f	movaps	-0xb0(%rbp), %xmm3
000000000145dea6	addps	%xmm3, %xmm15
000000000145deaa	mulps	%xmm7, %xmm15
000000000145deae	addps	-0x120(%rbp), %xmm15
000000000145deb6	cvttps2dq	%xmm12, %xmm0
000000000145debb	movdqa	-0x130(%rbp), %xmm6
000000000145dec3	paddd	%xmm6, %xmm0
000000000145dec7	pslld	$0x17, %xmm0
000000000145decc	mulps	%xmm15, %xmm0
000000000145ded0	blendps	$0xe, -0x190(%rbp), %xmm10      ## xmm10 = xmm10[0],mem[1,2,3]
000000000145dedb	blendps	$0xe, %xmm9, %xmm11             ## xmm11 = xmm11[0],xmm9[1,2,3]
000000000145dee2	maxss	%xmm5, %xmm11
000000000145dee7	cvtps2dq	%xmm11, %xmm7
000000000145deec	cvtdq2ps	%xmm7, %xmm7
000000000145deef	movaps	%xmm11, %xmm9
000000000145def3	cmpltss	%xmm7, %xmm9
000000000145def9	cvtdq2ps	%xmm9, %xmm9
000000000145defd	movaps	%xmm9, %xmm12
000000000145df01	addss	%xmm7, %xmm12
000000000145df06	addss	%xmm9, %xmm7
000000000145df0b	subss	%xmm12, %xmm11
000000000145df10	movaps	%xmm13, %xmm9
000000000145df14	movaps	%xmm13, %xmm15
000000000145df18	mulss	%xmm11, %xmm9
000000000145df1d	addss	%xmm1, %xmm9
000000000145df22	mulss	%xmm11, %xmm9
000000000145df27	addss	%xmm3, %xmm9
000000000145df2c	mulss	%xmm11, %xmm9
000000000145df31	movaps	-0xd0(%rbp), %xmm13
000000000145df39	addss	%xmm13, %xmm9
000000000145df3e	cvttps2dq	%xmm7, %xmm7
000000000145df42	paddd	%xmm6, %xmm7
000000000145df46	pslld	$0x17, %xmm7
000000000145df4b	mulss	%xmm9, %xmm7
000000000145df50	blendps	$0xe, %xmm4, %xmm14             ## xmm14 = xmm14[0],xmm4[1,2,3]
000000000145df57	maxss	%xmm5, %xmm10
000000000145df5c	cvtps2dq	%xmm10, %xmm4
000000000145df61	cvtdq2ps	%xmm4, %xmm4
000000000145df64	movaps	%xmm10, %xmm9
000000000145df68	cmpltss	%xmm4, %xmm9
000000000145df6e	maxss	%xmm5, %xmm14
000000000145df73	movaps	%xmm5, %xmm3
000000000145df76	cvtps2dq	%xmm14, %xmm11
000000000145df7b	cvtdq2ps	%xmm11, %xmm11
000000000145df7f	insertps	$0x1c, %xmm14, %xmm10           ## xmm10 = xmm10[0],xmm14[0],zero,zero
000000000145df86	cmpltss	%xmm11, %xmm14
000000000145df8c	insertps	$0x1c, %xmm14, %xmm9            ## xmm9 = xmm9[0],xmm14[0],zero,zero
000000000145df93	cvtdq2ps	%xmm9, %xmm9
000000000145df97	movaps	%xmm4, %xmm12
000000000145df9b	insertps	$0x1c, %xmm11, %xmm12           ## xmm12 = xmm12[0],xmm11[0],zero,zero
000000000145dfa2	addps	%xmm9, %xmm12
000000000145dfa6	blendps	$0x1, %xmm12, %xmm4             ## xmm4 = xmm12[0],xmm4[1,2,3]
000000000145dfad	insertps	$0x40, %xmm12, %xmm11           ## xmm11 = xmm12[1],xmm11[1,2,3]
000000000145dfb4	subps	%xmm12, %xmm10
000000000145dfb8	movaps	-0x140(%rbp), %xmm1
000000000145dfbf	mulps	%xmm10, %xmm1
000000000145dfc3	addps	-0x1e0(%rbp), %xmm1
000000000145dfca	mulps	%xmm10, %xmm1
000000000145dfce	addps	-0x1d0(%rbp), %xmm1
000000000145dfd5	mulps	%xmm10, %xmm1
000000000145dfd9	addps	-0x1c0(%rbp), %xmm1
000000000145dfe0	cvttps2dq	%xmm4, %xmm4
000000000145dfe4	paddd	%xmm6, %xmm4
000000000145dfe8	pslld	$0x17, %xmm4
000000000145dfed	cvttps2dq	%xmm11, %xmm9
000000000145dff2	paddd	%xmm6, %xmm9
000000000145dff7	movdqa	%xmm6, %xmm10
000000000145dffc	pslld	$0x17, %xmm9
000000000145e002	punpckldq	%xmm9, %xmm4            ## xmm4 = xmm4[0],xmm9[0],xmm4[1],xmm9[1]
000000000145e007	mulps	%xmm1, %xmm4
000000000145e00a	addss	%xmm4, %xmm7
000000000145e00e	movshdup	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1,3,3]
000000000145e012	addss	%xmm7, %xmm4
000000000145e016	shufps	$0x0, %xmm4, %xmm4              ## xmm4 = xmm4[0,0,0,0]
000000000145e01a	movaps	%xmm4, %xmm5
000000000145e01d	cmpltps	-0x50(%rbp), %xmm5
000000000145e022	andps	-0x40(%rbp), %xmm5
000000000145e026	movaps	-0xe0(%rbp), %xmm6
000000000145e02d	andps	%xmm4, %xmm6
000000000145e030	psrld	$0x17, %xmm4
000000000145e035	cvtdq2ps	%xmm4, %xmm4
000000000145e038	subps	%xmm5, %xmm4
000000000145e03b	subps	-0x60(%rbp), %xmm4
000000000145e03f	movaps	-0x120(%rbp), %xmm7
000000000145e046	orps	%xmm7, %xmm6
000000000145e049	movaps	-0x1a0(%rbp), %xmm1
000000000145e050	cmpltps	%xmm6, %xmm1
000000000145e054	andps	%xmm7, %xmm1
000000000145e057	addps	%xmm1, %xmm4
000000000145e05a	mulps	-0x90(%rbp), %xmm1
000000000145e061	mulps	%xmm6, %xmm1
000000000145e064	subps	%xmm7, %xmm6
000000000145e067	subps	%xmm1, %xmm6
000000000145e06a	movaps	-0x80(%rbp), %xmm5
000000000145e06e	mulps	%xmm6, %xmm5
000000000145e071	addps	-0x70(%rbp), %xmm5
000000000145e075	movaps	%xmm6, %xmm1
000000000145e078	mulps	%xmm6, %xmm1
000000000145e07b	mulps	%xmm1, %xmm5
000000000145e07e	mulps	%xmm6, %xmm2
000000000145e081	addps	-0x180(%rbp), %xmm2
000000000145e088	addps	%xmm5, %xmm2
000000000145e08b	mulps	%xmm6, %xmm2
000000000145e08e	addps	%xmm4, %xmm2
000000000145e091	mulps	%xmm8, %xmm2
000000000145e095	maxps	%xmm3, %xmm2
000000000145e098	cvtps2dq	%xmm2, %xmm1
000000000145e09c	cvtdq2ps	%xmm1, %xmm1
000000000145e09f	movaps	%xmm2, %xmm4
000000000145e0a2	cmpltps	%xmm1, %xmm4
000000000145e0a6	cvtdq2ps	%xmm4, %xmm4
000000000145e0a9	addps	%xmm1, %xmm4
000000000145e0ac	subps	%xmm4, %xmm2
000000000145e0af	mulps	%xmm2, %xmm15
000000000145e0b3	addps	-0xc0(%rbp), %xmm15
000000000145e0bb	mulps	%xmm2, %xmm15
000000000145e0bf	addps	-0xb0(%rbp), %xmm15
000000000145e0c7	mulps	%xmm2, %xmm15
000000000145e0cb	cvttps2dq	%xmm4, %xmm1
000000000145e0cf	paddd	%xmm10, %xmm1
000000000145e0d4	addps	%xmm7, %xmm15
000000000145e0d8	pslld	$0x17, %xmm1
000000000145e0dd	mulps	%xmm15, %xmm1
000000000145e0e1	movaps	%xmm0, %xmm2
000000000145e0e4	subps	%xmm7, %xmm2
000000000145e0e7	mulps	%xmm1, %xmm2
000000000145e0ea	subps	%xmm1, %xmm0
000000000145e0ed	rcpss	%xmm0, %xmm0
000000000145e0f1	mulss	0x380(%r15), %xmm0
000000000145e0fa	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000145e0fe	mulps	%xmm2, %xmm0
000000000145e101	maxps	%xmm13, %xmm0
000000000145e105	minps	%xmm7, %xmm0
000000000145e108	movaps	%xmm7, %xmm1
000000000145e10b	subps	%xmm0, %xmm1
000000000145e10e	mulps	0x100(%r15), %xmm1
000000000145e116	addps	0xe0(%r15), %xmm1
000000000145e11e	maxps	%xmm13, %xmm1
000000000145e122	minps	%xmm7, %xmm1
000000000145e125	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
000000000145e129	movaps	%xmm1, %xmm0
000000000145e12c	mulss	-0x2c(%rbp), %xmm0
000000000145e131	testl	%eax, %eax
000000000145e133	je	0x145d690
000000000145e139	addss	0x10ee2b(%rip), %xmm0
000000000145e141	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000145e147	xorps	%xmm0, %xmm0
000000000145e14a	maxss	%xmm0, %xmm1
000000000145e14e	minss	-0x110(%rbp), %xmm1
000000000145e156	movaps	%xmm1, %xmm0
000000000145e159	minss	-0x160(%rbp), %xmm0
000000000145e161	cvttss2si	%xmm0, %r12d
000000000145e166	movq	0x60(%rbx), %r13
000000000145e16a	movslq	%r12d, %r12
000000000145e16d	xorps	%xmm0, %xmm0
000000000145e170	cvtsi2ss	%r12d, %xmm0
000000000145e175	shlq	$0x4, %r12
000000000145e179	subss	%xmm0, %xmm1
000000000145e17d	movaps	(%r13,%r12), %xmm0
000000000145e183	movaps	0x10(%r13,%r12), %xmm2
000000000145e189	subps	%xmm0, %xmm2
000000000145e18c	shufps	$0x0, %xmm1, %xmm1              ## xmm1 = xmm1[0,0,0,0]
000000000145e190	mulps	%xmm2, %xmm1
000000000145e193	addps	%xmm0, %xmm1
000000000145e196	jmp	0x145d6b5
000000000145e19b	nopl	(%rax,%rax)
