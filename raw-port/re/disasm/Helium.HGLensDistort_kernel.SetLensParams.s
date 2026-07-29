__ZN20HGLensDistort_kernel13SetLensParamsEfffffff:
000000000022a0c0	pushq	%rbp
000000000022a0c1	movq	%rsp, %rbp
000000000022a0c4	pushq	%rbx
000000000022a0c5	subq	$0xa8, %rsp
000000000022a0cc	movss	%xmm3, -0x14(%rbp)
000000000022a0d1	movss	%xmm2, -0x10(%rbp)
000000000022a0d6	movaps	%xmm1, -0xa0(%rbp)
000000000022a0dd	movaps	%xmm0, -0xb0(%rbp)
000000000022a0e4	movq	%rdi, %rbx
000000000022a0e7	movaps	%xmm4, -0x70(%rbp)
000000000022a0eb	movaps	%xmm4, %xmm3
000000000022a0ee	movaps	%xmm5, -0x80(%rbp)
000000000022a0f2	insertps	$0x10, %xmm5, %xmm3             ## xmm3 = xmm3[0],xmm5[0],xmm3[2,3]
000000000022a0f8	movaps	0x19db31(%rip), %xmm4
000000000022a0ff	movaps	%xmm6, %xmm1
000000000022a102	andps	%xmm4, %xmm1
000000000022a105	xorps	%xmm0, %xmm0
000000000022a108	cvtss2sd	%xmm1, %xmm0
000000000022a10c	ucomisd	0x1a82e4(%rip), %xmm0
000000000022a114	xorps	%xmm2, %xmm2
000000000022a117	jbe	0x22a12c
000000000022a119	xorps	%xmm0, %xmm0
000000000022a11c	cmpless	%xmm6, %xmm0
000000000022a121	movss	0x1a825f(%rip), %xmm1
000000000022a129	andps	%xmm0, %xmm1
000000000022a12c	movaps	%xmm6, -0x90(%rbp)
000000000022a133	andps	%xmm3, %xmm4
000000000022a136	movaps	%xmm4, -0x60(%rbp)
000000000022a13a	ucomiss	%xmm2, %xmm1
000000000022a13d	jne	0x22a141
000000000022a13f	jnp	0x22a14d
000000000022a141	movss	0x19db77(%rip), %xmm2
000000000022a149	divss	%xmm1, %xmm2
000000000022a14d	movss	%xmm2, -0xc(%rbp)
000000000022a152	xorps	%xmm0, %xmm0
000000000022a155	cmpleps	%xmm3, %xmm0
000000000022a159	movaps	%xmm0, -0x40(%rbp)
000000000022a15d	xorps	%xmm0, %xmm0
000000000022a160	cvtss2sd	%xmm1, %xmm0
000000000022a164	mulsd	0x1a2054(%rip), %xmm0
000000000022a16c	movaps	%xmm1, -0x50(%rbp)
000000000022a170	movaps	%xmm3, -0x30(%rbp)
000000000022a174	callq	0x3c5642                        ## symbol stub for: _tan
000000000022a179	addsd	%xmm0, %xmm0
000000000022a17d	xorps	%xmm1, %xmm1
000000000022a180	cvtsd2ss	%xmm0, %xmm1
000000000022a184	movss	0x19db34(%rip), %xmm2
000000000022a18c	divss	%xmm1, %xmm2
000000000022a190	movaps	-0xb0(%rbp), %xmm5
000000000022a197	movss	%xmm5, 0x1a8(%rbx)
000000000022a19f	movaps	-0xa0(%rbp), %xmm6
000000000022a1a6	movss	%xmm6, 0x1ac(%rbx)
000000000022a1ae	movss	-0x10(%rbp), %xmm4
000000000022a1b3	movss	%xmm4, 0x1b0(%rbx)
000000000022a1bb	movss	-0x14(%rbp), %xmm3
000000000022a1c0	movss	%xmm3, 0x1b4(%rbx)
000000000022a1c8	movaps	-0x70(%rbp), %xmm0
000000000022a1cc	movss	%xmm0, 0x1b8(%rbx)
000000000022a1d4	movaps	-0x80(%rbp), %xmm0
000000000022a1d8	movss	%xmm0, 0x1bc(%rbx)
000000000022a1e0	movaps	-0x90(%rbp), %xmm0
000000000022a1e7	movss	%xmm0, 0x1c0(%rbx)
000000000022a1ef	movaps	0x1ae7da(%rip), %xmm7
000000000022a1f6	movaps	-0x60(%rbp), %xmm0
000000000022a1fa	cmpltps	%xmm7, %xmm0
000000000022a1fe	movaps	-0x40(%rbp), %xmm8
000000000022a203	andps	%xmm7, %xmm8
000000000022a207	movaps	-0x30(%rbp), %xmm7
000000000022a20b	blendvps	%xmm0, %xmm8, %xmm7
000000000022a211	insertps	$0x10, %xmm6, %xmm5             ## xmm5 = xmm5[0],xmm6[0],xmm5[2,3]
000000000022a217	divps	%xmm7, %xmm5
000000000022a21a	movaps	0x19fe8f(%rip), %xmm0
000000000022a221	divps	%xmm5, %xmm0
000000000022a224	movlhps	%xmm0, %xmm5                    ## xmm5 = xmm5[0],xmm0[0]
000000000022a227	movups	%xmm5, 0x1c4(%rbx)
000000000022a22e	movss	%xmm4, 0x1d4(%rbx)
000000000022a236	movss	%xmm3, 0x1d8(%rbx)
000000000022a23e	movaps	-0x50(%rbp), %xmm0
000000000022a242	movss	%xmm0, 0x1dc(%rbx)
000000000022a24a	movss	-0xc(%rbp), %xmm0
000000000022a24f	movss	%xmm0, 0x1e0(%rbx)
000000000022a257	movss	%xmm1, 0x1e4(%rbx)
000000000022a25f	movss	%xmm2, 0x1e8(%rbx)
000000000022a267	movq	(%rbx), %rax
000000000022a26a	movq	%rbx, %rdi
000000000022a26d	addq	$0xa8, %rsp
000000000022a274	popq	%rbx
000000000022a275	popq	%rbp
000000000022a276	jmpq	*0x240(%rax)
000000000022a27c	nopl	(%rax)
