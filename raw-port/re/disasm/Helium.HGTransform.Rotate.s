__ZN11HGTransform6RotateEdddd:
00000000001b49f0	pushq	%rbp
00000000001b49f1	movq	%rsp, %rbp
00000000001b49f4	pushq	%r14
00000000001b49f6	pushq	%rbx
00000000001b49f7	subq	$0xf0, %rsp
00000000001b49fe	movaps	%xmm3, -0x30(%rbp)
00000000001b4a02	movapd	%xmm2, -0x40(%rbp)
00000000001b4a07	movaps	%xmm1, -0x60(%rbp)
00000000001b4a0b	movq	%rdi, %rbx
00000000001b4a0e	mulsd	0x6a898a(%rip), %xmm0
00000000001b4a16	movsd	%xmm0, -0x50(%rbp)
00000000001b4a1b	callq	0x3c55dc                        ## symbol stub for: _sin
00000000001b4a20	movapd	-0x40(%rbp), %xmm4
00000000001b4a25	movapd	-0x60(%rbp), %xmm3
00000000001b4a2a	cvtsd2ss	%xmm0, %xmm0
00000000001b4a2e	xorps	%xmm1, %xmm1
00000000001b4a31	ucomiss	%xmm1, %xmm0
00000000001b4a34	jne	0x1b4a3c
00000000001b4a36	jnp	0x1b4c4a
00000000001b4a3c	movapd	%xmm3, %xmm6
00000000001b4a40	mulsd	%xmm3, %xmm6
00000000001b4a44	movapd	-0x30(%rbp), %xmm2
00000000001b4a49	movapd	%xmm2, %xmm5
00000000001b4a4d	unpcklpd	%xmm4, %xmm5                    ## xmm5 = xmm5[0],xmm4[0]
00000000001b4a51	mulpd	%xmm5, %xmm5
00000000001b4a55	movapd	%xmm5, %xmm1
00000000001b4a59	unpckhpd	%xmm5, %xmm1                    ## xmm1 = xmm1[1],xmm5[1]
00000000001b4a5d	addsd	%xmm6, %xmm1
00000000001b4a61	addsd	%xmm5, %xmm1
00000000001b4a65	ucomisd	0x2157f3(%rip), %xmm1
00000000001b4a6d	unpcklpd	%xmm2, %xmm4                    ## xmm4 = xmm4[0],xmm2[0]
00000000001b4a71	jne	0x1b4a75
00000000001b4a73	jnp	0x1b4aba
00000000001b4a75	xorpd	%xmm2, %xmm2
00000000001b4a79	ucomisd	%xmm2, %xmm1
00000000001b4a7d	jne	0x1b4a85
00000000001b4a7f	jnp	0x1b4c4a
00000000001b4a85	xorps	%xmm2, %xmm2
00000000001b4a88	sqrtsd	%xmm1, %xmm2
00000000001b4a8c	divsd	%xmm2, %xmm3
00000000001b4a90	movapd	%xmm3, -0x60(%rbp)
00000000001b4a95	movddup	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0]
00000000001b4a99	divpd	%xmm2, %xmm4
00000000001b4a9d	movapd	%xmm4, -0x40(%rbp)
00000000001b4aa2	divsd	%xmm1, %xmm6
00000000001b4aa6	movsd	%xmm6, -0x18(%rbp)
00000000001b4aab	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000001b4aaf	divpd	%xmm1, %xmm5
00000000001b4ab3	movapd	%xmm5, -0x30(%rbp)
00000000001b4ab8	jmp	0x1b4ac9
00000000001b4aba	movapd	%xmm4, -0x40(%rbp)
00000000001b4abf	movapd	%xmm5, -0x30(%rbp)
00000000001b4ac4	movsd	%xmm6, -0x18(%rbp)
00000000001b4ac9	cvtss2sd	%xmm0, %xmm0
00000000001b4acd	movaps	%xmm0, -0x70(%rbp)
00000000001b4ad1	movsd	-0x50(%rbp), %xmm0
00000000001b4ad6	callq	0x3c5072                        ## symbol stub for: _cos
00000000001b4adb	cvtsd2ss	%xmm0, %xmm0
00000000001b4adf	cvtss2sd	%xmm0, %xmm0
00000000001b4ae3	movaps	%xmm0, -0x50(%rbp)
00000000001b4ae7	leaq	-0x100(%rbp), %r14
00000000001b4aee	movq	%r14, %rdi
00000000001b4af1	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001b4af6	leaq	0x87269b(%rip), %rax
00000000001b4afd	movq	%rax, -0x100(%rbp)
00000000001b4b04	xorps	%xmm0, %xmm0
00000000001b4b07	movups	%xmm0, -0xd8(%rbp)
00000000001b4b0e	movups	%xmm0, -0xc8(%rbp)
00000000001b4b15	movups	%xmm0, -0xb8(%rbp)
00000000001b4b1c	movups	%xmm0, -0xa8(%rbp)
00000000001b4b23	movups	%xmm0, -0x98(%rbp)
00000000001b4b2a	movups	%xmm0, -0x88(%rbp)
00000000001b4b31	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b4b3b	movq	%rax, -0x78(%rbp)
00000000001b4b3f	movsd	0x215719(%rip), %xmm0
00000000001b4b47	movapd	-0x50(%rbp), %xmm8
00000000001b4b4d	subsd	%xmm8, %xmm0
00000000001b4b52	movsd	-0x18(%rbp), %xmm1
00000000001b4b57	mulsd	%xmm0, %xmm1
00000000001b4b5b	addsd	%xmm8, %xmm1
00000000001b4b60	movsd	%xmm1, -0xf0(%rbp)
00000000001b4b68	movapd	-0x60(%rbp), %xmm7
00000000001b4b6d	movddup	%xmm7, %xmm3                    ## xmm3 = xmm7[0,0]
00000000001b4b71	movapd	-0x40(%rbp), %xmm9
00000000001b4b77	mulpd	%xmm9, %xmm3
00000000001b4b7c	movapd	-0x70(%rbp), %xmm10
00000000001b4b82	movddup	%xmm10, %xmm2                   ## xmm2 = xmm10[0,0]
00000000001b4b87	mulpd	%xmm9, %xmm2
00000000001b4b8c	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
00000000001b4b90	mulpd	%xmm3, %xmm1
00000000001b4b94	movapd	%xmm1, %xmm3
00000000001b4b98	movapd	%xmm2, %xmm4
00000000001b4b9c	movapd	%xmm1, %xmm5
00000000001b4ba0	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000001b4ba4	subpd	%xmm2, %xmm1
00000000001b4ba8	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
00000000001b4bad	addsubpd	%xmm2, %xmm3
00000000001b4bb1	movupd	%xmm3, -0xe8(%rbp)
00000000001b4bb9	movapd	-0x30(%rbp), %xmm6
00000000001b4bbe	movapd	%xmm6, %xmm2
00000000001b4bc2	unpckhpd	%xmm6, %xmm2                    ## xmm2 = xmm2[1],xmm6[1]
00000000001b4bc6	mulsd	%xmm0, %xmm2
00000000001b4bca	shufpd	$0x1, %xmm2, %xmm4              ## xmm4 = xmm4[1],xmm2[0]
00000000001b4bcf	unpcklpd	%xmm8, %xmm5                    ## xmm5 = xmm5[0],xmm8[0]
00000000001b4bd4	addpd	%xmm4, %xmm5
00000000001b4bd8	movupd	%xmm5, -0xd0(%rbp)
00000000001b4be0	movapd	%xmm9, %xmm2
00000000001b4be5	unpckhpd	%xmm9, %xmm2                    ## xmm2 = xmm2[1],xmm9[1]
00000000001b4bea	mulsd	%xmm9, %xmm2
00000000001b4bef	mulsd	%xmm0, %xmm2
00000000001b4bf3	mulsd	%xmm10, %xmm7
00000000001b4bf8	movddup	%xmm2, %xmm3                    ## xmm3 = xmm2[0,0]
00000000001b4bfc	subsd	%xmm7, %xmm2
00000000001b4c00	movsd	%xmm2, -0xc0(%rbp)
00000000001b4c08	movddup	%xmm7, %xmm2                    ## xmm2 = xmm7[0,0]
00000000001b4c0c	addpd	%xmm3, %xmm2
00000000001b4c10	blendpd	$0x2, %xmm2, %xmm1              ## xmm1 = xmm1[0],xmm2[1]
00000000001b4c16	movupd	%xmm1, -0xb0(%rbp)
00000000001b4c1e	mulsd	%xmm6, %xmm0
00000000001b4c22	addsd	%xmm8, %xmm0
00000000001b4c27	movsd	%xmm0, -0xa0(%rbp)
00000000001b4c2f	movq	(%rbx), %rax
00000000001b4c32	movq	%rbx, %rdi
00000000001b4c35	movq	%r14, %rsi
00000000001b4c38	callq	*0xc0(%rax)
00000000001b4c3e	leaq	-0x100(%rbp), %rdi
00000000001b4c45	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b4c4a	addq	$0xf0, %rsp
00000000001b4c51	popq	%rbx
00000000001b4c52	popq	%r14
00000000001b4c54	popq	%rbp
00000000001b4c55	retq
00000000001b4c56	movq	%rax, %rbx
00000000001b4c59	leaq	-0x100(%rbp), %rdi
00000000001b4c60	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b4c65	movq	%rbx, %rdi
00000000001b4c68	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b4c6d	nopl	(%rax)
