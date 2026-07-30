__Z37PCComputeQuadToSquareProjectionMatrixRK9PCVector2IdES2_S2_S2_R14PCMatrix44TmplIdE:
0000000000067d5c	movupd	(%rsi), %xmm2
0000000000067d60	movupd	(%rdx), %xmm4
0000000000067d64	movupd	(%rcx), %xmm6
0000000000067d68	movupd	(%rdi), %xmm0
0000000000067d6c	movapd	%xmm0, %xmm5
0000000000067d70	subpd	%xmm2, %xmm5
0000000000067d74	addpd	%xmm4, %xmm5
0000000000067d78	subpd	%xmm6, %xmm5
0000000000067d7c	movapd	0xba8ec(%rip), %xmm1
0000000000067d84	andpd	%xmm5, %xmm1
0000000000067d88	cmpltpd	0xbb87f(%rip), %xmm1
0000000000067d91	movmskpd	%xmm1, %eax
0000000000067d95	cmpl	$0x3, %eax
0000000000067d98	jne	0x67dc0
0000000000067d9a	movapd	%xmm2, %xmm5
0000000000067d9e	movsd	%xmm4, %xmm5                    ## xmm5 = xmm4[0],xmm5[1]
0000000000067da2	movapd	%xmm0, %xmm1
0000000000067da6	movsd	%xmm2, %xmm1                    ## xmm1 = xmm2[0],xmm1[1]
0000000000067daa	subpd	%xmm1, %xmm5
0000000000067dae	movsd	%xmm2, %xmm4                    ## xmm4 = xmm2[0],xmm4[1]
0000000000067db2	movsd	%xmm0, %xmm2                    ## xmm2 = xmm0[0],xmm2[1]
0000000000067db6	subpd	%xmm2, %xmm4
0000000000067dba	xorpd	%xmm1, %xmm1
0000000000067dbe	jmp	0x67e3e
0000000000067dc0	movapd	%xmm6, %xmm3
0000000000067dc4	movsd	%xmm2, %xmm3                    ## xmm3 = xmm2[0],xmm3[1]
0000000000067dc8	movapd	%xmm3, %xmm7
0000000000067dcc	subpd	%xmm4, %xmm7
0000000000067dd0	movapd	%xmm7, %xmm1
0000000000067dd4	shufpd	$0x1, %xmm7, %xmm1              ## xmm1 = xmm1[1],xmm7[0]
0000000000067dd9	movsd	%xmm6, %xmm2                    ## xmm2 = xmm6[0],xmm2[1]
0000000000067ddd	movapd	%xmm2, %xmm6
0000000000067de1	subpd	%xmm4, %xmm6
0000000000067de5	movapd	%xmm7, %xmm4
0000000000067de9	unpcklpd	%xmm6, %xmm4                    ## xmm4 = xmm4[0],xmm6[0]
0000000000067ded	unpckhpd	%xmm6, %xmm7                    ## xmm7 = xmm7[1],xmm6[1]
0000000000067df1	mulpd	%xmm4, %xmm7
0000000000067df5	movapd	%xmm3, %xmm4
0000000000067df9	subpd	%xmm0, %xmm4
0000000000067dfd	movapd	%xmm2, %xmm8
0000000000067e02	subpd	%xmm0, %xmm8
0000000000067e07	mulpd	%xmm5, %xmm1
0000000000067e0b	shufpd	$0x1, %xmm5, %xmm5              ## xmm5 = xmm5[1,0]
0000000000067e10	mulpd	%xmm6, %xmm5
0000000000067e14	subpd	%xmm5, %xmm1
0000000000067e18	hsubpd	%xmm7, %xmm7
0000000000067e1c	divpd	%xmm7, %xmm1
0000000000067e20	mulpd	%xmm1, %xmm3
0000000000067e24	addpd	%xmm4, %xmm3
0000000000067e28	movapd	%xmm1, %xmm5
0000000000067e2c	shufpd	$0x1, %xmm1, %xmm5              ## xmm5 = xmm5[1],xmm1[0]
0000000000067e31	mulpd	%xmm2, %xmm5
0000000000067e35	addpd	%xmm8, %xmm5
0000000000067e3a	movapd	%xmm3, %xmm4
0000000000067e3e	pushq	%rbp
0000000000067e3f	movq	%rsp, %rbp
0000000000067e42	movapd	%xmm1, %xmm2
0000000000067e46	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
0000000000067e4a	movapd	%xmm0, %xmm3
0000000000067e4e	unpckhpd	%xmm0, %xmm3                    ## xmm3 = xmm3[1],xmm0[1]
0000000000067e52	movapd	%xmm3, %xmm10
0000000000067e57	movapd	%xmm0, %xmm11
0000000000067e5c	mulsd	%xmm2, %xmm11
0000000000067e61	movapd	%xmm3, %xmm6
0000000000067e65	movapd	%xmm4, %xmm8
0000000000067e6a	unpckhpd	%xmm4, %xmm8                    ## xmm8 = xmm8[1],xmm4[1]
0000000000067e6f	movapd	%xmm0, %xmm7
0000000000067e73	mulsd	%xmm8, %xmm7
0000000000067e78	movapd	%xmm1, %xmm9
0000000000067e7d	mulpd	%xmm5, %xmm9
0000000000067e82	movapd	%xmm1, %xmm12
0000000000067e87	shufpd	$0x1, %xmm1, %xmm12             ## xmm12 = xmm12[1],xmm1[0]
0000000000067e8d	mulpd	%xmm4, %xmm12
0000000000067e92	subpd	%xmm12, %xmm9
0000000000067e97	movapd	%xmm3, %xmm12
0000000000067e9c	mulsd	%xmm1, %xmm12
0000000000067ea1	mulsd	%xmm4, %xmm3
0000000000067ea5	mulsd	%xmm4, %xmm8
0000000000067eaa	unpcklpd	%xmm4, %xmm12                   ## xmm12 = xmm12[0],xmm4[0]
0000000000067eaf	shufpd	$0x1, %xmm11, %xmm4             ## xmm4 = xmm4[1],xmm11[0]
0000000000067eb5	mulsd	%xmm2, %xmm10
0000000000067eba	mulsd	%xmm5, %xmm6
0000000000067ebe	unpcklpd	%xmm5, %xmm10                   ## xmm10 = xmm10[0],xmm5[0]
0000000000067ec3	subpd	%xmm10, %xmm4
0000000000067ec8	movapd	%xmm6, %xmm10
0000000000067ecd	subsd	%xmm7, %xmm10
0000000000067ed2	movupd	%xmm4, (%r8)
0000000000067ed7	movapd	%xmm0, %xmm11
0000000000067edc	mulpd	%xmm1, %xmm11
0000000000067ee1	xorl	%eax, %eax
0000000000067ee3	movq	%rax, 0x10(%r8)
0000000000067ee7	movsd	%xmm10, 0x18(%r8)
0000000000067eed	movapd	%xmm5, %xmm4
0000000000067ef1	unpckhpd	%xmm5, %xmm4                    ## xmm4 = xmm4[1],xmm5[1]
0000000000067ef5	mulsd	%xmm4, %xmm0
0000000000067ef9	mulsd	%xmm5, %xmm4
0000000000067efd	shufpd	$0x1, %xmm11, %xmm5             ## xmm5 = xmm5[1],xmm11[0]
0000000000067f03	subpd	%xmm5, %xmm12
0000000000067f08	movupd	%xmm12, 0x20(%r8)
0000000000067f0e	movapd	%xmm0, %xmm5
0000000000067f12	subsd	%xmm3, %xmm5
0000000000067f16	movq	%rax, 0x30(%r8)
0000000000067f1a	movsd	%xmm5, 0x38(%r8)
0000000000067f20	xorpd	%xmm5, %xmm5
0000000000067f24	movupd	%xmm5, 0x40(%r8)
0000000000067f2a	mulsd	%xmm1, %xmm6
0000000000067f2e	addsd	%xmm8, %xmm6
0000000000067f33	subsd	%xmm4, %xmm8
0000000000067f38	movsd	%xmm8, 0x50(%r8)
0000000000067f3e	movq	%rax, 0x58(%r8)
0000000000067f42	shufpd	$0x1, %xmm9, %xmm9              ## xmm9 = xmm9[1,0]
0000000000067f48	movupd	%xmm9, 0x60(%r8)
0000000000067f4e	movq	%rax, 0x70(%r8)
0000000000067f52	movsd	%xmm8, 0x78(%r8)
0000000000067f58	mulsd	%xmm2, %xmm0
0000000000067f5c	addsd	%xmm6, %xmm0
0000000000067f60	mulsd	%xmm1, %xmm7
0000000000067f64	subsd	%xmm7, %xmm0
0000000000067f68	subsd	%xmm4, %xmm0
0000000000067f6c	mulsd	%xmm2, %xmm3
0000000000067f70	subsd	%xmm3, %xmm0
0000000000067f74	movsd	0xba5b4(%rip), %xmm1
0000000000067f7c	divsd	%xmm0, %xmm1
0000000000067f80	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
0000000000067f84	xorl	%ecx, %ecx
0000000000067f86	movupd	(%r8,%rcx,8), %xmm1
0000000000067f8c	mulpd	%xmm0, %xmm1
0000000000067f90	movupd	%xmm1, (%r8,%rcx,8)
0000000000067f96	addq	$0x2, %rcx
0000000000067f9a	cmpq	$0x4, %rcx
0000000000067f9e	jne	0x67f86
0000000000067fa0	incq	%rax
0000000000067fa3	addq	$0x20, %r8
0000000000067fa7	cmpq	$0x4, %rax
0000000000067fab	jne	0x67f84
0000000000067fad	popq	%rbp
0000000000067fae	retq
