__ZN26MaterialTextureTransformer25decomposeTextureTransformERK14PCMatrix44TmplIdER9PCVector2IdERdS6_:
00000000004af2f0	pushq	%rbp
00000000004af2f1	movq	%rsp, %rbp
00000000004af2f4	pushq	%r15
00000000004af2f6	pushq	%r14
00000000004af2f8	pushq	%r12
00000000004af2fa	pushq	%rbx
00000000004af2fb	subq	$0x1b0, %rsp                    ## imm = 0x1B0
00000000004af302	movq	%rcx, %r15
00000000004af305	movq	%rdx, %r12
00000000004af308	movq	%rsi, %rbx
00000000004af30b	movq	%rdi, %r14
00000000004af30e	xorps	%xmm0, %xmm0
00000000004af311	movaps	%xmm0, -0x130(%rbp)
00000000004af318	movaps	%xmm0, -0x140(%rbp)
00000000004af31f	movaps	%xmm0, -0x150(%rbp)
00000000004af326	movl	$0x4, -0x120(%rbp)
00000000004af330	movups	%xmm0, -0x118(%rbp)
00000000004af337	movups	%xmm0, -0x108(%rbp)
00000000004af33e	movq	$0x0, -0xf8(%rbp)
00000000004af349	leaq	-0x150(%rbp), %rsi
00000000004af350	callq	__ZNK14PCMatrix44TmplIdE17getTransformationER20PCMatrix44ParametersIdE ## PCMatrix44Tmpl<double>::getTransformation(PCMatrix44Parameters<double>&) const
00000000004af355	xorpd	%xmm4, %xmm4
00000000004af359	movupd	-0x138(%rbp), %xmm0
00000000004af361	movapd	0x257a77(%rip), %xmm1
00000000004af369	divpd	%xmm0, %xmm1
00000000004af36d	movupd	%xmm1, (%r15)
00000000004af372	movsd	-0x108(%rbp), %xmm0
00000000004af37a	movapd	0x2581de(%rip), %xmm7
00000000004af382	xorpd	%xmm0, %xmm7
00000000004af386	movlpd	%xmm7, (%r12)
00000000004af38c	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000004af396	movq	%rax, -0x28(%rbp)
00000000004af39a	movq	%rax, -0x50(%rbp)
00000000004af39e	movq	%rax, -0x78(%rbp)
00000000004af3a2	movq	%rax, -0xa0(%rbp)
00000000004af3a9	movupd	%xmm4, -0x98(%rbp)
00000000004af3b1	movupd	%xmm4, -0x88(%rbp)
00000000004af3b9	movapd	%xmm4, -0x70(%rbp)
00000000004af3be	movapd	%xmm4, -0x60(%rbp)
00000000004af3c3	movupd	%xmm4, -0x48(%rbp)
00000000004af3c8	movupd	%xmm4, -0x38(%rbp)
00000000004af3cd	movupd	(%r15), %xmm2
00000000004af3d2	movsd	0x8(%r15), %xmm3
00000000004af3d8	ucomisd	0x256000(%rip), %xmm2
00000000004af3e0	jne	0x4af3e4
00000000004af3e2	jnp	0x4af462
00000000004af3e4	movsd	%xmm2, -0xa0(%rbp)
00000000004af3ec	xorpd	%xmm1, %xmm1
00000000004af3f0	mulsd	%xmm2, %xmm1
00000000004af3f4	movsd	%xmm1, -0x98(%rbp)
00000000004af3fc	movsd	%xmm1, -0x90(%rbp)
00000000004af404	movsd	%xmm1, -0x88(%rbp)
00000000004af40c	movapd	%xmm2, %xmm5
00000000004af410	unpcklpd	%xmm1, %xmm5                    ## xmm5 = xmm5[0],xmm1[0]
00000000004af414	movsd	0x255fc4(%rip), %xmm1
00000000004af41c	ucomisd	%xmm1, %xmm3
00000000004af420	jne	0x4af424
00000000004af422	jnp	0x4af47a
00000000004af424	xorpd	%xmm6, %xmm6
00000000004af428	mulsd	%xmm3, %xmm6
00000000004af42c	movsd	%xmm6, -0x80(%rbp)
00000000004af431	movsd	%xmm3, -0x78(%rbp)
00000000004af436	movsd	%xmm6, -0x70(%rbp)
00000000004af43b	movsd	%xmm6, -0x68(%rbp)
00000000004af440	blendpd	$0x1, %xmm6, %xmm2              ## xmm2 = xmm6[0],xmm2[1]
00000000004af446	unpcklpd	%xmm3, %xmm6                    ## xmm6 = xmm6[0],xmm3[0]
00000000004af44a	movapd	%xmm2, %xmm4
00000000004af44e	xorpd	%xmm8, %xmm8
00000000004af453	ucomisd	%xmm8, %xmm0
00000000004af458	jne	0x4af494
00000000004af45a	jnp	0x4af623
00000000004af460	jmp	0x4af494
00000000004af462	movsd	0x255f76(%rip), %xmm5
00000000004af46a	movsd	0x255f6e(%rip), %xmm1
00000000004af472	ucomisd	%xmm1, %xmm3
00000000004af476	jne	0x4af424
00000000004af478	jp	0x4af424
00000000004af47a	unpcklpd	%xmm1, %xmm4                    ## xmm4 = xmm4[0],xmm1[0]
00000000004af47e	movapd	%xmm4, %xmm6
00000000004af482	xorpd	%xmm8, %xmm8
00000000004af487	ucomisd	%xmm8, %xmm0
00000000004af48c	jne	0x4af494
00000000004af48e	jnp	0x4af623
00000000004af494	movsd	0x259934(%rip), %xmm3
00000000004af49c	addsd	%xmm0, %xmm3
00000000004af4a0	andpd	0x257968(%rip), %xmm3
00000000004af4a8	movsd	0x257a20(%rip), %xmm2
00000000004af4b0	ucomisd	%xmm3, %xmm2
00000000004af4b4	ja	0x4af5c8
00000000004af4ba	movsd	0x259916(%rip), %xmm3
00000000004af4c2	addsd	%xmm0, %xmm3
00000000004af4c6	andpd	0x257942(%rip), %xmm3
00000000004af4ce	ucomisd	%xmm3, %xmm2
00000000004af4d2	ja	0x4af5c8
00000000004af4d8	movsd	0x259900(%rip), %xmm3
00000000004af4e0	addsd	%xmm0, %xmm3
00000000004af4e4	andpd	0x257924(%rip), %xmm3
00000000004af4ec	movsd	0x258234(%rip), %xmm1
00000000004af4f4	ucomisd	%xmm3, %xmm2
00000000004af4f8	ja	0x4af5c8
00000000004af4fe	movsd	0x2598e2(%rip), %xmm3
00000000004af506	addsd	%xmm0, %xmm3
00000000004af50a	andpd	0x2578fe(%rip), %xmm3
00000000004af512	ucomisd	%xmm3, %xmm2
00000000004af516	ja	0x4af5c8
00000000004af51c	movsd	0x2598cc(%rip), %xmm3
00000000004af524	addsd	%xmm0, %xmm3
00000000004af528	andpd	0x2578e0(%rip), %xmm3
00000000004af530	xorpd	%xmm1, %xmm1
00000000004af534	movsd	0x2581eb(%rip), %xmm8
00000000004af53d	ucomisd	%xmm3, %xmm2
00000000004af541	ja	0x4af5c8
00000000004af547	movsd	0x259871(%rip), %xmm3
00000000004af54f	addsd	%xmm0, %xmm3
00000000004af553	andpd	0x2578b5(%rip), %xmm3
00000000004af55b	ucomisd	%xmm3, %xmm2
00000000004af55f	ja	0x4af5c8
00000000004af561	movapd	%xmm4, -0xf0(%rbp)
00000000004af569	movapd	%xmm5, -0xe0(%rbp)
00000000004af571	movapd	%xmm6, -0xd0(%rbp)
00000000004af579	movapd	%xmm7, -0xc0(%rbp)
00000000004af581	callq	0x6dfd92                        ## symbol stub for: _cos
00000000004af586	movapd	%xmm0, -0xb0(%rbp)
00000000004af58e	movapd	-0xc0(%rbp), %xmm0
00000000004af596	callq	0x6e00da                        ## symbol stub for: _sin
00000000004af59b	movapd	-0xb0(%rbp), %xmm8
00000000004af5a4	movapd	-0xd0(%rbp), %xmm6
00000000004af5ac	movapd	-0xe0(%rbp), %xmm5
00000000004af5b4	movapd	-0xf0(%rbp), %xmm4
00000000004af5bc	movapd	%xmm0, %xmm1
00000000004af5c0	xorpd	0x257f98(%rip), %xmm1
00000000004af5c8	movddup	%xmm8, %xmm0                    ## xmm0 = xmm8[0,0]
00000000004af5cd	mulpd	%xmm0, %xmm6
00000000004af5d1	mulpd	%xmm5, %xmm0
00000000004af5d5	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000004af5d9	mulpd	%xmm1, %xmm4
00000000004af5dd	mulpd	%xmm5, %xmm1
00000000004af5e1	movapd	%xmm0, %xmm2
00000000004af5e5	addpd	%xmm4, %xmm2
00000000004af5e9	movapd	%xmm2, -0xa0(%rbp)
00000000004af5f1	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
00000000004af5f5	addsd	%xmm4, %xmm0
00000000004af5f9	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000004af5fd	movapd	%xmm0, -0x90(%rbp)
00000000004af605	movapd	%xmm6, %xmm0
00000000004af609	subpd	%xmm1, %xmm0
00000000004af60d	movapd	%xmm0, -0x80(%rbp)
00000000004af612	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000004af616	subsd	%xmm1, %xmm6
00000000004af61a	movddup	%xmm6, %xmm0                    ## xmm0 = xmm6[0,0]
00000000004af61e	movapd	%xmm0, -0x70(%rbp)
00000000004af623	leaq	-0x1d0(%rbp), %rdi
00000000004af62a	leaq	-0xa0(%rbp), %rsi
00000000004af631	movq	%r14, %rdx
00000000004af634	callq	__ZNK14PCMatrix44TmplIdEmlERKS0_ ## PCMatrix44Tmpl<double>::operator*(PCMatrix44Tmpl<double> const&) const
00000000004af639	movups	-0x1b8(%rbp), %xmm0
00000000004af640	movhps	-0x198(%rbp), %xmm0             ## xmm0 = xmm0[0,1],mem[0,1]
00000000004af647	xorps	0x257f12(%rip), %xmm0
00000000004af64e	movups	%xmm0, (%rbx)
00000000004af651	addq	$0x1b0, %rsp                    ## imm = 0x1B0
00000000004af658	popq	%rbx
00000000004af659	popq	%r12
00000000004af65b	popq	%r14
00000000004af65d	popq	%r15
00000000004af65f	popq	%rbp
00000000004af660	retq
00000000004af661	nopw	%cs:(%rax,%rax)