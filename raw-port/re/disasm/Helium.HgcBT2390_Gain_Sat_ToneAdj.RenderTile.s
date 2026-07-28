__ZN26HgcBT2390_Gain_Sat_ToneAdj10RenderTileEP6HGTile:
000000000035ec80	pushq	%rbp
000000000035ec81	movq	%rsp, %rbp
000000000035ec84	pushq	%r14
000000000035ec86	pushq	%rbx
000000000035ec87	subq	$0xe0, %rsp
000000000035ec8e	movq	%rsi, %r14
000000000035ec91	movq	%rdi, %rbx
000000000035ec94	movq	%rsi, %rdi
000000000035ec97	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
000000000035ec9c	movq	%rax, %rdi
000000000035ec9f	xorl	%esi, %esi
000000000035eca1	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000035eca6	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000035ecab	jb	0x35ecc6
000000000035ecad	movq	%rbx, %rdi
000000000035ecb0	movq	%r14, %rsi
000000000035ecb3	callq	__ZN26HgcBT2390_Gain_Sat_ToneAdj14RenderTile_AVXEP6HGTile ## HgcBT2390_Gain_Sat_ToneAdj::RenderTile_AVX(HGTile*)
000000000035ecb8	xorl	%eax, %eax
000000000035ecba	addq	$0xe0, %rsp
000000000035ecc1	popq	%rbx
000000000035ecc2	popq	%r14
000000000035ecc4	popq	%rbp
000000000035ecc5	retq
000000000035ecc6	movl	0x8(%r14), %r9d
000000000035ecca	subl	(%r14), %r9d
000000000035eccd	movl	0xc(%r14), %ecx
000000000035ecd1	subl	0x4(%r14), %ecx
000000000035ecd5	movslq	0x58(%r14), %rdx
000000000035ecd9	movq	0x50(%r14), %rsi
000000000035ecdd	movq	0x10(%r14), %rdi
000000000035ece1	movslq	0x18(%r14), %r8
000000000035ece5	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
000000000035ecea	jbe	0x35f130
000000000035ecf0	testl	%ecx, %ecx
000000000035ecf2	jle	0x35ecb8
000000000035ecf4	testl	%r9d, %r9d
000000000035ecf7	jle	0x35ecb8
000000000035ecf9	movl	%r9d, %eax
000000000035ecfc	shlq	$0x4, %rdx
000000000035ed00	shlq	$0x4, %r8
000000000035ed04	shlq	$0x4, %rax
000000000035ed08	xorl	%r9d, %r9d
000000000035ed0b	nopl	(%rax,%rax)
000000000035ed10	xorl	%r10d, %r10d
000000000035ed13	nopw	%cs:(%rax,%rax)
000000000035ed20	movaps	(%rsi,%r10), %xmm3
000000000035ed25	movq	0x198(%rbx), %r11
000000000035ed2c	movaps	(%r11), %xmm1
000000000035ed30	movaps	%xmm1, -0xf0(%rbp)
000000000035ed37	movaps	0x40(%r11), %xmm4
000000000035ed3c	movaps	0x60(%r11), %xmm5
000000000035ed41	movaps	0x80(%r11), %xmm2
000000000035ed49	movaps	%xmm2, -0xe0(%rbp)
000000000035ed50	maxps	%xmm1, %xmm3
000000000035ed53	movaps	0x20(%r11), %xmm15
000000000035ed58	mulps	%xmm3, %xmm15
000000000035ed5c	movaps	%xmm4, %xmm0
000000000035ed5f	movaps	%xmm4, %xmm8
000000000035ed63	movaps	%xmm4, -0x80(%rbp)
000000000035ed67	cmpeqps	%xmm1, %xmm0
000000000035ed6b	andps	%xmm5, %xmm0
000000000035ed6e	cmpnleps	%xmm1, %xmm0
000000000035ed72	movaps	%xmm15, %xmm1
000000000035ed76	blendvps	%xmm0, %xmm5, %xmm1
000000000035ed7b	movaps	%xmm2, %xmm0
000000000035ed7e	andps	%xmm1, %xmm0
000000000035ed81	movaps	0xa0(%r11), %xmm4
000000000035ed89	movaps	%xmm4, -0xd0(%rbp)
000000000035ed90	orps	%xmm5, %xmm0
000000000035ed93	movaps	%xmm1, %xmm2
000000000035ed96	cmpltps	%xmm4, %xmm2
000000000035ed9a	movaps	0xc0(%r11), %xmm4
000000000035eda2	andps	%xmm4, %xmm2
000000000035eda5	psrld	$0x17, %xmm1
000000000035edaa	cvtdq2ps	%xmm1, %xmm1
000000000035edad	movaps	0xe0(%r11), %xmm6
000000000035edb5	movaps	%xmm6, -0xc0(%rbp)
000000000035edbc	subps	%xmm2, %xmm1
000000000035edbf	movaps	0x100(%r11), %xmm11
000000000035edc7	movaps	%xmm11, %xmm2
000000000035edcb	cmpltps	%xmm0, %xmm2
000000000035edcf	subps	%xmm6, %xmm1
000000000035edd2	andps	%xmm5, %xmm2
000000000035edd5	addps	%xmm2, %xmm1
000000000035edd8	movaps	0x120(%r11), %xmm6
000000000035ede0	movaps	%xmm6, -0xb0(%rbp)
000000000035ede7	mulps	%xmm6, %xmm2
000000000035edea	mulps	%xmm0, %xmm2
000000000035eded	subps	%xmm5, %xmm0
000000000035edf0	subps	%xmm2, %xmm0
000000000035edf3	movaps	%xmm0, %xmm2
000000000035edf6	movaps	0x140(%r11), %xmm6
000000000035edfe	movaps	%xmm6, -0xa0(%rbp)
000000000035ee05	mulps	%xmm0, %xmm6
000000000035ee08	mulps	%xmm0, %xmm2
000000000035ee0b	movaps	0x160(%r11), %xmm7
000000000035ee13	movaps	%xmm7, -0x70(%rbp)
000000000035ee17	addps	%xmm7, %xmm6
000000000035ee1a	movaps	0x180(%r11), %xmm13
000000000035ee22	movaps	%xmm13, %xmm7
000000000035ee26	mulps	%xmm0, %xmm7
000000000035ee29	movaps	0x1a0(%r11), %xmm9
000000000035ee31	movaps	%xmm9, -0x60(%rbp)
000000000035ee36	addps	%xmm9, %xmm7
000000000035ee3a	mulps	%xmm2, %xmm7
000000000035ee3d	addps	%xmm6, %xmm7
000000000035ee40	mulps	%xmm2, %xmm7
000000000035ee43	movaps	0x1c0(%r11), %xmm10
000000000035ee4b	movaps	%xmm10, %xmm2
000000000035ee4f	mulps	%xmm0, %xmm2
000000000035ee52	movaps	0x1e0(%r11), %xmm6
000000000035ee5a	movaps	%xmm6, -0x50(%rbp)
000000000035ee5e	addps	%xmm6, %xmm2
000000000035ee61	addps	%xmm2, %xmm7
000000000035ee64	mulps	%xmm0, %xmm7
000000000035ee67	movaps	0x200(%r11), %xmm6
000000000035ee6f	addps	%xmm6, %xmm7
000000000035ee72	mulps	%xmm0, %xmm7
000000000035ee75	addps	%xmm1, %xmm7
000000000035ee78	mulps	%xmm8, %xmm7
000000000035ee7c	movaps	0x220(%r11), %xmm0
000000000035ee84	movaps	%xmm0, -0x40(%rbp)
000000000035ee88	maxps	%xmm0, %xmm7
000000000035ee8b	roundps	$0x9, %xmm7, %xmm0
000000000035ee91	subps	%xmm0, %xmm7
000000000035ee94	movaps	%xmm7, %xmm1
000000000035ee97	mulps	%xmm7, %xmm1
000000000035ee9a	movaps	0x240(%r11), %xmm2
000000000035eea2	movaps	%xmm7, %xmm8
000000000035eea6	mulps	%xmm2, %xmm8
000000000035eeaa	movaps	0x260(%r11), %xmm9
000000000035eeb2	movaps	%xmm9, -0x30(%rbp)
000000000035eeb7	addps	%xmm9, %xmm8
000000000035eebb	mulps	%xmm1, %xmm8
000000000035eebf	movaps	0x280(%r11), %xmm14
000000000035eec7	movaps	%xmm7, %xmm12
000000000035eecb	mulps	%xmm14, %xmm12
000000000035eecf	addps	0x2a0(%r11), %xmm12
000000000035eed7	addps	%xmm8, %xmm12
000000000035eedb	mulps	%xmm7, %xmm12
000000000035eedf	addps	0x2c0(%r11), %xmm12
000000000035eee7	mulps	%xmm7, %xmm12
000000000035eeeb	addps	%xmm5, %xmm12
000000000035eeef	cvttps2dq	%xmm0, %xmm8
000000000035eef4	movdqa	0x2e0(%r11), %xmm1
000000000035eefd	paddd	%xmm1, %xmm8
000000000035ef02	pslld	$0x17, %xmm8
000000000035ef08	mulps	%xmm12, %xmm8
000000000035ef0c	blendps	$0xc, %xmm3, %xmm8              ## xmm8 = xmm8[0,1],xmm3[2,3]
000000000035ef13	shufps	$0xd4, %xmm8, %xmm8             ## xmm8 = xmm8[0,1,1,3]
000000000035ef18	mulps	%xmm5, %xmm8
000000000035ef1c	movaps	%xmm8, %xmm0
000000000035ef20	shufps	$0x0, %xmm8, %xmm0              ## xmm0 = xmm0[0,0],xmm8[0,0]
000000000035ef25	movaps	0x3e0(%r11), %xmm3
000000000035ef2d	movaps	%xmm3, -0x90(%rbp)
000000000035ef34	mulps	%xmm3, %xmm0
000000000035ef37	movsldup	%xmm8, %xmm5                    ## xmm5 = xmm8[0,0,2,2]
000000000035ef3c	addps	%xmm0, %xmm5
000000000035ef3f	blendps	$0x7, %xmm15, %xmm5             ## xmm5 = xmm15[0,1,2],xmm5[3]
000000000035ef46	mulps	0x300(%r11), %xmm5
000000000035ef4e	movaps	%xmm3, %xmm0
000000000035ef51	shufps	$0xff, %xmm3, %xmm0             ## xmm0 = xmm0[3,3],xmm3[3,3]
000000000035ef55	mulps	%xmm5, %xmm0
000000000035ef58	movshdup	%xmm5, %xmm12                   ## xmm12 = xmm5[1,1,3,3]
000000000035ef5d	addps	%xmm0, %xmm12
000000000035ef61	movaps	0x3c0(%r11), %xmm15
000000000035ef69	movaps	0x3a0(%r11), %xmm3
000000000035ef71	movaps	%xmm3, -0x20(%rbp)
000000000035ef75	movaps	%xmm15, %xmm0
000000000035ef79	cmpeqps	%xmm3, %xmm0
000000000035ef7d	movaps	0x380(%r11), %xmm3
000000000035ef85	andps	%xmm3, %xmm0
000000000035ef88	cmpnleps	%xmm15, %xmm0
000000000035ef8d	movaps	%xmm5, %xmm9
000000000035ef91	blendps	$0x1, %xmm12, %xmm9             ## xmm9 = xmm12[0],xmm9[1,2,3]
000000000035ef98	movaps	%xmm9, %xmm7
000000000035ef9c	blendvps	%xmm0, %xmm3, %xmm7
000000000035efa1	movaps	%xmm7, %xmm0
000000000035efa4	cmpltps	0x340(%r11), %xmm0
000000000035efad	andps	%xmm14, %xmm0
000000000035efb1	pand	%xmm7, %xmm1
000000000035efb5	psrld	$0x17, %xmm7
000000000035efba	cvtdq2ps	%xmm7, %xmm7
000000000035efbd	subps	%xmm0, %xmm7
000000000035efc0	subps	-0x30(%rbp), %xmm7
000000000035efc4	por	%xmm3, %xmm1
000000000035efc8	cmpltps	%xmm1, %xmm2
000000000035efcc	andps	%xmm3, %xmm2
000000000035efcf	addps	%xmm2, %xmm7
000000000035efd2	mulps	-0x40(%rbp), %xmm2
000000000035efd6	mulps	%xmm1, %xmm2
000000000035efd9	subps	%xmm3, %xmm1
000000000035efdc	subps	%xmm2, %xmm1
000000000035efdf	mulps	%xmm1, %xmm6
000000000035efe2	addps	-0x50(%rbp), %xmm6
000000000035efe6	mulps	%xmm1, %xmm10
000000000035efea	addps	-0x60(%rbp), %xmm10
000000000035efef	mulps	%xmm1, %xmm13
000000000035eff3	addps	-0x70(%rbp), %xmm13
000000000035eff8	movaps	%xmm1, %xmm0
000000000035effb	mulps	%xmm1, %xmm0
000000000035effe	mulps	%xmm0, %xmm10
000000000035f002	addps	%xmm6, %xmm10
000000000035f006	mulps	%xmm0, %xmm10
000000000035f00a	addps	%xmm13, %xmm10
000000000035f00e	mulps	%xmm1, %xmm10
000000000035f012	addps	-0xa0(%rbp), %xmm10
000000000035f01a	mulps	%xmm1, %xmm10
000000000035f01e	addps	%xmm7, %xmm10
000000000035f022	movaps	-0x20(%rbp), %xmm6
000000000035f026	mulps	%xmm6, %xmm10
000000000035f02a	maxps	-0xb0(%rbp), %xmm10
000000000035f032	roundps	$0x9, %xmm10, %xmm0
000000000035f039	subps	%xmm0, %xmm10
000000000035f03d	mulps	%xmm10, %xmm11
000000000035f041	addps	-0xc0(%rbp), %xmm11
000000000035f049	movaps	%xmm10, %xmm1
000000000035f04d	mulps	%xmm10, %xmm1
000000000035f051	mulps	%xmm1, %xmm11
000000000035f055	mulps	%xmm10, %xmm4
000000000035f059	addps	-0xd0(%rbp), %xmm4
000000000035f060	addps	%xmm11, %xmm4
000000000035f064	mulps	%xmm10, %xmm4
000000000035f068	addps	-0x80(%rbp), %xmm4
000000000035f06c	mulps	%xmm10, %xmm4
000000000035f070	cvttps2dq	%xmm0, %xmm1
000000000035f074	paddd	-0xe0(%rbp), %xmm1
000000000035f07c	addps	%xmm3, %xmm4
000000000035f07f	pslld	$0x17, %xmm1
000000000035f084	mulps	%xmm4, %xmm1
000000000035f087	movsldup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0,2,2]
000000000035f08b	mulps	%xmm15, %xmm0
000000000035f08f	addps	%xmm9, %xmm0
000000000035f093	movaps	%xmm15, %xmm2
000000000035f097	movhlps	%xmm5, %xmm5                    ## xmm5 = xmm5[1,1]
000000000035f09a	shufps	$0xff, %xmm15, %xmm2            ## xmm2 = xmm2[3,3],xmm15[3,3]
000000000035f09f	mulps	%xmm5, %xmm2
000000000035f0a2	shufps	$0xff, %xmm0, %xmm0             ## xmm0 = xmm0[3,3,3,3]
000000000035f0a6	addps	%xmm12, %xmm2
000000000035f0aa	movaps	%xmm0, %xmm4
000000000035f0ad	rcpss	%xmm0, %xmm4
000000000035f0b1	mulps	0x360(%r11), %xmm4
000000000035f0b9	minss	%xmm3, %xmm4
000000000035f0bd	maxss	%xmm6, %xmm4
000000000035f0c1	movaps	%xmm4, %xmm3
000000000035f0c4	mulps	%xmm0, %xmm3
000000000035f0c7	subps	%xmm3, %xmm15
000000000035f0cb	mulps	%xmm4, %xmm15
000000000035f0cf	cmpnless	-0xf0(%rbp), %xmm0
000000000035f0d8	mulps	%xmm2, %xmm15
000000000035f0dc	movddup	0x388(%r11), %xmm2              ## xmm2 = mem[0,0]
000000000035f0e5	blendvps	%xmm0, %xmm15, %xmm2
000000000035f0eb	blendps	$0x3, %xmm8, %xmm1              ## xmm1 = xmm8[0,1],xmm1[2,3]
000000000035f0f2	shufps	$0x0, %xmm2, %xmm2              ## xmm2 = xmm2[0,0,0,0]
000000000035f0f6	mulps	%xmm1, %xmm2
000000000035f0f9	mulps	-0x90(%rbp), %xmm2
000000000035f100	blendps	$0x8, %xmm8, %xmm2              ## xmm2 = xmm2[0,1,2],xmm8[3]
000000000035f107	movaps	%xmm2, (%rdi,%r10)
000000000035f10c	addq	$0x10, %r10
000000000035f110	cmpq	%r10, %rax
000000000035f113	jne	0x35ed20
000000000035f119	incl	%r9d
000000000035f11c	addq	%rdx, %rsi
000000000035f11f	addq	%r8, %rdi
000000000035f122	cmpl	%ecx, %r9d
000000000035f125	jne	0x35ed10
000000000035f12b	jmp	0x35ecb8
000000000035f130	testl	%ecx, %ecx
000000000035f132	jle	0x35ecb8
000000000035f138	testl	%r9d, %r9d
000000000035f13b	jle	0x35ecb8
000000000035f141	movl	%r9d, %eax
000000000035f144	shlq	$0x4, %rdx
000000000035f148	shlq	$0x4, %r8
000000000035f14c	shlq	$0x4, %rax
000000000035f150	xorl	%r9d, %r9d
000000000035f153	nopw	%cs:(%rax,%rax)
000000000035f160	xorl	%r10d, %r10d
000000000035f163	nopw	%cs:(%rax,%rax)
000000000035f170	movaps	(%rsi,%r10), %xmm6
000000000035f175	movq	0x198(%rbx), %r11
000000000035f17c	movaps	(%r11), %xmm1
000000000035f180	movaps	%xmm1, -0xf0(%rbp)
000000000035f187	movaps	0x40(%r11), %xmm3
000000000035f18c	movaps	0x60(%r11), %xmm4
000000000035f191	movaps	0x80(%r11), %xmm2
000000000035f199	movaps	%xmm2, -0xe0(%rbp)
000000000035f1a0	maxps	%xmm1, %xmm6
000000000035f1a3	movaps	0x20(%r11), %xmm7
000000000035f1a8	mulps	%xmm6, %xmm7
000000000035f1ab	movaps	%xmm3, %xmm0
000000000035f1ae	movaps	%xmm3, %xmm10
000000000035f1b2	movaps	%xmm3, -0x80(%rbp)
000000000035f1b6	cmpeqps	%xmm1, %xmm0
000000000035f1ba	andps	%xmm4, %xmm0
000000000035f1bd	cmpleps	%xmm1, %xmm0
000000000035f1c1	movaps	%xmm4, %xmm1
000000000035f1c4	blendvps	%xmm0, %xmm7, %xmm1
000000000035f1c9	movaps	%xmm2, %xmm0
000000000035f1cc	andps	%xmm1, %xmm0
000000000035f1cf	movaps	0xa0(%r11), %xmm2
000000000035f1d7	movaps	%xmm2, -0xd0(%rbp)
000000000035f1de	orps	%xmm4, %xmm0
000000000035f1e1	movaps	%xmm1, %xmm3
000000000035f1e4	cmpltps	%xmm2, %xmm3
000000000035f1e8	movaps	0xc0(%r11), %xmm5
000000000035f1f0	andps	%xmm5, %xmm3
000000000035f1f3	psrld	$0x17, %xmm1
000000000035f1f8	cvtdq2ps	%xmm1, %xmm2
000000000035f1fb	movaps	0xe0(%r11), %xmm8
000000000035f203	movaps	%xmm8, -0xc0(%rbp)
000000000035f20b	subps	%xmm3, %xmm2
000000000035f20e	movaps	0x100(%r11), %xmm12
000000000035f216	movaps	%xmm12, %xmm1
000000000035f21a	cmpltps	%xmm0, %xmm1
000000000035f21e	subps	%xmm8, %xmm2
000000000035f222	andps	%xmm4, %xmm1
000000000035f225	addps	%xmm1, %xmm2
000000000035f228	movaps	0x120(%r11), %xmm3
000000000035f230	movaps	%xmm3, -0xb0(%rbp)
000000000035f237	mulps	%xmm3, %xmm1
000000000035f23a	mulps	%xmm0, %xmm1
000000000035f23d	subps	%xmm4, %xmm0
000000000035f240	subps	%xmm1, %xmm0
000000000035f243	movaps	%xmm0, %xmm3
000000000035f246	movaps	0x140(%r11), %xmm8
000000000035f24e	movaps	%xmm8, -0x90(%rbp)
000000000035f256	mulps	%xmm0, %xmm8
000000000035f25a	mulps	%xmm0, %xmm3
000000000035f25d	movaps	0x160(%r11), %xmm1
000000000035f265	movaps	%xmm1, -0x60(%rbp)
000000000035f269	addps	%xmm1, %xmm8
000000000035f26d	movaps	0x180(%r11), %xmm14
000000000035f275	movaps	%xmm14, %xmm1
000000000035f279	mulps	%xmm0, %xmm1
000000000035f27c	movaps	0x1a0(%r11), %xmm9
000000000035f284	movaps	%xmm9, -0x50(%rbp)
000000000035f289	addps	%xmm9, %xmm1
000000000035f28d	mulps	%xmm3, %xmm1
000000000035f290	addps	%xmm8, %xmm1
000000000035f294	mulps	%xmm3, %xmm1
000000000035f297	movaps	0x1c0(%r11), %xmm11
000000000035f29f	movaps	%xmm11, %xmm3
000000000035f2a3	mulps	%xmm0, %xmm3
000000000035f2a6	movaps	0x1e0(%r11), %xmm8
000000000035f2ae	movaps	%xmm8, -0x40(%rbp)
000000000035f2b3	addps	%xmm8, %xmm3
000000000035f2b7	addps	%xmm3, %xmm1
000000000035f2ba	mulps	%xmm0, %xmm1
000000000035f2bd	movaps	0x200(%r11), %xmm9
000000000035f2c5	addps	%xmm9, %xmm1
000000000035f2c9	mulps	%xmm0, %xmm1
000000000035f2cc	addps	%xmm2, %xmm1
000000000035f2cf	mulps	%xmm10, %xmm1
000000000035f2d3	movaps	0x220(%r11), %xmm0
000000000035f2db	movaps	%xmm0, -0x30(%rbp)
000000000035f2df	maxps	%xmm0, %xmm1
000000000035f2e2	cvtps2dq	%xmm1, %xmm0
000000000035f2e6	cvtdq2ps	%xmm0, %xmm0
000000000035f2e9	movaps	%xmm1, %xmm2
000000000035f2ec	cmpltps	%xmm0, %xmm2
000000000035f2f0	cvtdq2ps	%xmm2, %xmm3
000000000035f2f3	addps	%xmm0, %xmm3
000000000035f2f6	subps	%xmm3, %xmm1
000000000035f2f9	movaps	0x240(%r11), %xmm2
000000000035f301	movaps	%xmm2, %xmm0
000000000035f304	mulps	%xmm1, %xmm0
000000000035f307	movaps	%xmm1, %xmm10
000000000035f30b	mulps	%xmm1, %xmm10
000000000035f30f	movaps	0x260(%r11), %xmm15
000000000035f317	addps	%xmm15, %xmm0
000000000035f31b	mulps	%xmm10, %xmm0
000000000035f31f	movaps	0x280(%r11), %xmm13
000000000035f327	movaps	%xmm13, %xmm10
000000000035f32b	mulps	%xmm1, %xmm10
000000000035f32f	addps	0x2a0(%r11), %xmm10
000000000035f337	addps	%xmm0, %xmm10
000000000035f33b	mulps	%xmm1, %xmm10
000000000035f33f	addps	0x2c0(%r11), %xmm10
000000000035f347	mulps	%xmm1, %xmm10
000000000035f34b	addps	%xmm4, %xmm10
000000000035f34f	cvttps2dq	%xmm3, %xmm3
000000000035f353	movdqa	0x2e0(%r11), %xmm1
000000000035f35c	paddd	%xmm1, %xmm3
000000000035f360	pslld	$0x17, %xmm3
000000000035f365	mulps	%xmm10, %xmm3
000000000035f369	blendps	$0xc, %xmm6, %xmm3              ## xmm3 = xmm3[0,1],xmm6[2,3]
000000000035f36f	shufps	$0xd4, %xmm3, %xmm3             ## xmm3 = xmm3[0,1,1,3]
000000000035f373	mulps	%xmm4, %xmm3
000000000035f376	movaps	%xmm3, %xmm0
000000000035f379	shufps	$0x0, %xmm3, %xmm0              ## xmm0 = xmm0[0,0],xmm3[0,0]
000000000035f37d	movaps	0x3e0(%r11), %xmm6
000000000035f385	mulps	%xmm6, %xmm0
000000000035f388	movaps	%xmm6, -0xa0(%rbp)
000000000035f38f	movsldup	%xmm3, %xmm4                    ## xmm4 = xmm3[0,0,2,2]
000000000035f393	addps	%xmm0, %xmm4
000000000035f396	movaps	0x400(%r11), %xmm10
000000000035f39e	movaps	%xmm10, %xmm0
000000000035f3a2	andnps	%xmm7, %xmm0
000000000035f3a5	andps	%xmm10, %xmm4
000000000035f3a9	orps	%xmm4, %xmm0
000000000035f3ac	movaps	0x300(%r11), %xmm4
000000000035f3b4	movaps	%xmm4, -0x70(%rbp)
000000000035f3b8	mulps	%xmm4, %xmm0
000000000035f3bb	movaps	%xmm6, %xmm4
000000000035f3be	shufps	$0xff, %xmm6, %xmm4             ## xmm4 = xmm4[3,3],xmm6[3,3]
000000000035f3c2	mulps	%xmm0, %xmm4
000000000035f3c5	movshdup	%xmm0, %xmm6                    ## xmm6 = xmm0[1,1,3,3]
000000000035f3c9	addps	%xmm4, %xmm6
000000000035f3cc	blendps	$0xe, %xmm0, %xmm6              ## xmm6 = xmm6[0],xmm0[1,2,3]
000000000035f3d2	movaps	0x3c0(%r11), %xmm4
000000000035f3da	movaps	0x3a0(%r11), %xmm7
000000000035f3e2	movaps	%xmm7, -0x20(%rbp)
000000000035f3e6	movaps	%xmm4, %xmm0
000000000035f3e9	cmpeqps	%xmm7, %xmm0
000000000035f3ed	movaps	0x380(%r11), %xmm8
000000000035f3f5	andps	%xmm8, %xmm0
000000000035f3f9	cmpleps	%xmm4, %xmm0
000000000035f3fd	movaps	%xmm8, %xmm7
000000000035f401	blendvps	%xmm0, %xmm6, %xmm7
000000000035f406	movaps	%xmm7, %xmm0
000000000035f409	cmpltps	0x340(%r11), %xmm0
000000000035f412	andps	%xmm13, %xmm0
000000000035f416	pand	%xmm7, %xmm1
000000000035f41a	psrld	$0x17, %xmm7
000000000035f41f	cvtdq2ps	%xmm7, %xmm7
000000000035f422	subps	%xmm0, %xmm7
000000000035f425	subps	%xmm15, %xmm7
000000000035f429	por	%xmm8, %xmm1
000000000035f42e	cmpltps	%xmm1, %xmm2
000000000035f432	andps	%xmm8, %xmm2
000000000035f436	addps	%xmm2, %xmm7
000000000035f439	mulps	-0x30(%rbp), %xmm2
000000000035f43d	mulps	%xmm1, %xmm2
000000000035f440	subps	%xmm8, %xmm1
000000000035f444	subps	%xmm2, %xmm1
000000000035f447	mulps	%xmm1, %xmm9
000000000035f44b	addps	-0x40(%rbp), %xmm9
000000000035f450	mulps	%xmm1, %xmm11
000000000035f454	addps	-0x50(%rbp), %xmm11
000000000035f459	movaps	%xmm1, %xmm0
000000000035f45c	mulps	%xmm1, %xmm0
000000000035f45f	mulps	%xmm0, %xmm11
000000000035f463	addps	%xmm9, %xmm11
000000000035f467	mulps	%xmm1, %xmm14
000000000035f46b	addps	-0x60(%rbp), %xmm14
000000000035f470	mulps	%xmm0, %xmm11
000000000035f474	addps	%xmm14, %xmm11
000000000035f478	mulps	%xmm1, %xmm11
000000000035f47c	addps	-0x90(%rbp), %xmm11
000000000035f484	mulps	%xmm1, %xmm11
000000000035f488	addps	%xmm7, %xmm11
000000000035f48c	movaps	-0x20(%rbp), %xmm7
000000000035f490	mulps	%xmm7, %xmm11
000000000035f494	maxps	-0xb0(%rbp), %xmm11
000000000035f49c	cvtps2dq	%xmm11, %xmm0
000000000035f4a1	cvtdq2ps	%xmm0, %xmm0
000000000035f4a4	movaps	%xmm11, %xmm1
000000000035f4a8	cmpltps	%xmm0, %xmm1
000000000035f4ac	cvtdq2ps	%xmm1, %xmm1
000000000035f4af	addps	%xmm0, %xmm1
000000000035f4b2	subps	%xmm1, %xmm11
000000000035f4b6	mulps	%xmm11, %xmm12
000000000035f4ba	addps	-0xc0(%rbp), %xmm12
000000000035f4c2	movaps	%xmm11, %xmm0
000000000035f4c6	mulps	%xmm11, %xmm0
000000000035f4ca	mulps	%xmm0, %xmm12
000000000035f4ce	mulps	%xmm11, %xmm5
000000000035f4d2	addps	-0xd0(%rbp), %xmm5
000000000035f4d9	addps	%xmm12, %xmm5
000000000035f4dd	mulps	%xmm11, %xmm5
000000000035f4e1	addps	-0x80(%rbp), %xmm5
000000000035f4e5	mulps	%xmm11, %xmm5
000000000035f4e9	cvttps2dq	%xmm1, %xmm0
000000000035f4ed	paddd	-0xe0(%rbp), %xmm0
000000000035f4f5	addps	%xmm8, %xmm5
000000000035f4f9	pslld	$0x17, %xmm0
000000000035f4fe	mulps	%xmm5, %xmm0
000000000035f501	movaps	0x420(%r11), %xmm1
000000000035f509	andps	%xmm1, %xmm0
000000000035f50c	andnps	%xmm3, %xmm1
000000000035f50f	orps	%xmm0, %xmm1
000000000035f512	pshufd	$0xa0, %xmm1, %xmm0             ## xmm0 = xmm1[0,0,2,2]
000000000035f517	mulps	%xmm4, %xmm0
000000000035f51a	addps	%xmm6, %xmm0
000000000035f51d	movaps	0x440(%r11), %xmm2
000000000035f525	andps	%xmm2, %xmm0
000000000035f528	andnps	%xmm6, %xmm2
000000000035f52b	orps	%xmm0, %xmm2
000000000035f52e	shufps	$0xff, %xmm4, %xmm4             ## xmm4 = xmm4[3,3,3,3]
000000000035f532	pshufd	$0xee, %xmm2, %xmm0             ## xmm0 = xmm2[2,3,2,3]
000000000035f537	mulss	%xmm0, %xmm4
000000000035f53b	pshufd	$0xff, %xmm2, %xmm0             ## xmm0 = xmm2[3,3,3,3]
000000000035f540	movdqa	%xmm0, %xmm3
000000000035f544	rcpss	%xmm0, %xmm3
000000000035f548	mulps	0x360(%r11), %xmm3
000000000035f550	minss	%xmm8, %xmm3
000000000035f555	addss	%xmm2, %xmm4
000000000035f559	maxss	%xmm7, %xmm3
000000000035f55d	movaps	%xmm3, %xmm2
000000000035f560	movss	0x3c0(%r11), %xmm5
000000000035f569	mulss	%xmm0, %xmm2
000000000035f56d	subss	%xmm2, %xmm5
000000000035f571	mulss	%xmm3, %xmm5
000000000035f575	mulss	%xmm4, %xmm5
000000000035f579	cmpless	-0xf0(%rbp), %xmm0
000000000035f582	blendvps	%xmm0, -0x70(%rbp), %xmm5
000000000035f588	shufps	$0x0, %xmm5, %xmm5              ## xmm5 = xmm5[0,0,0,0]
000000000035f58c	mulps	%xmm1, %xmm5
000000000035f58f	movaps	0x460(%r11), %xmm0
000000000035f597	andps	%xmm0, %xmm5
000000000035f59a	andnps	%xmm1, %xmm0
000000000035f59d	orps	%xmm5, %xmm0
000000000035f5a0	movaps	-0xa0(%rbp), %xmm1
000000000035f5a7	mulps	%xmm0, %xmm1
000000000035f5aa	andps	%xmm10, %xmm0
000000000035f5ae	andnps	%xmm1, %xmm10
000000000035f5b2	orps	%xmm0, %xmm10
000000000035f5b6	movaps	%xmm10, (%rdi,%r10)
000000000035f5bb	addq	$0x10, %r10
000000000035f5bf	cmpq	%r10, %rax
000000000035f5c2	jne	0x35f170
000000000035f5c8	incl	%r9d
000000000035f5cb	addq	%rdx, %rsi
000000000035f5ce	addq	%r8, %rdi
000000000035f5d1	cmpl	%ecx, %r9d
000000000035f5d4	jne	0x35f160
000000000035f5da	jmp	0x35ecb8
000000000035f5df	nop
