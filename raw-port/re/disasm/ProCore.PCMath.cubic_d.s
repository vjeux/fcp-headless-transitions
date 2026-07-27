__ZN6PCMath5cubicEdddRdS0_S0_:
0000000000012c56	pushq	%rbp
0000000000012c57	movq	%rsp, %rbp
0000000000012c5a	pushq	%r15
0000000000012c5c	pushq	%r14
0000000000012c5e	pushq	%rbx
0000000000012c5f	subq	$0x38, %rsp
0000000000012c63	unpcklpd	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
0000000000012c67	movsd	0x10fe21(%rip), %xmm5
0000000000012c6f	unpcklpd	%xmm0, %xmm5                    ## xmm5 = xmm5[0],xmm0[0]
0000000000012c73	mulpd	%xmm2, %xmm5
0000000000012c77	movsd	0x10f9a9(%rip), %xmm4
0000000000012c7f	mulsd	%xmm1, %xmm4
0000000000012c83	movapd	%xmm0, %xmm2
0000000000012c87	addsd	%xmm0, %xmm2
0000000000012c8b	mulsd	%xmm0, %xmm2
0000000000012c8f	mulsd	%xmm0, %xmm2
0000000000012c93	movsd	0x10fdfd(%rip), %xmm3
0000000000012c9b	movapd	%xmm0, -0x40(%rbp)
0000000000012ca0	mulsd	%xmm0, %xmm3
0000000000012ca4	mulsd	%xmm1, %xmm3
0000000000012ca8	subsd	%xmm3, %xmm2
0000000000012cac	movddup	%xmm4, %xmm0                    ## xmm0 = xmm4[0,0]
0000000000012cb0	addpd	%xmm5, %xmm2
0000000000012cb4	subpd	%xmm0, %xmm5
0000000000012cb8	movsd	%xmm2, %xmm5                    ## xmm5 = xmm2[0],xmm5[1]
0000000000012cbc	divpd	0x10fe7c(%rip), %xmm5
0000000000012cc4	movq	%rdi, %rbx
0000000000012cc7	movapd	%xmm5, %xmm1
0000000000012ccb	unpckhpd	%xmm5, %xmm1                    ## xmm1 = xmm1[1],xmm5[1]
0000000000012ccf	movapd	%xmm1, -0x30(%rbp)
0000000000012cd4	mulsd	%xmm1, %xmm1
0000000000012cd8	movapd	%xmm5, %xmm0
0000000000012cdc	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000012ce0	mulpd	%xmm5, %xmm0
0000000000012ce4	movapd	%xmm0, %xmm1
0000000000012ce8	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000012cec	ucomisd	%xmm0, %xmm1
0000000000012cf0	jbe	0x12dce
0000000000012cf6	movq	%rdx, %r15
0000000000012cf9	movq	%rsi, %r14
0000000000012cfc	xorps	%xmm0, %xmm0
0000000000012cff	sqrtsd	%xmm1, %xmm0
0000000000012d03	divsd	%xmm0, %xmm5
0000000000012d07	movapd	%xmm5, %xmm0
0000000000012d0b	callq	0xde774                         ## symbol stub for: _acos
0000000000012d10	xorps	%xmm1, %xmm1
0000000000012d13	sqrtsd	-0x30(%rbp), %xmm1
0000000000012d18	mulsd	0x10fd80(%rip), %xmm1
0000000000012d20	movsd	%xmm1, -0x30(%rbp)
0000000000012d25	movsd	%xmm0, -0x50(%rbp)
0000000000012d2a	divsd	0x10f8f6(%rip), %xmm0
0000000000012d32	callq	0xde7ce                         ## symbol stub for: _cos
0000000000012d37	mulsd	-0x30(%rbp), %xmm0
0000000000012d3c	movapd	-0x40(%rbp), %xmm2
0000000000012d41	movsd	0x10f8df(%rip), %xmm1
0000000000012d49	divsd	%xmm1, %xmm2
0000000000012d4d	movapd	%xmm2, -0x40(%rbp)
0000000000012d52	subsd	%xmm2, %xmm0
0000000000012d56	movsd	%xmm0, (%rbx)
0000000000012d5a	movsd	0x10f7fe(%rip), %xmm0
0000000000012d62	addsd	-0x50(%rbp), %xmm0
0000000000012d67	divsd	%xmm1, %xmm0
0000000000012d6b	callq	0xde7ce                         ## symbol stub for: _cos
0000000000012d70	mulsd	-0x30(%rbp), %xmm0
0000000000012d75	subsd	-0x40(%rbp), %xmm0
0000000000012d7a	movsd	%xmm0, (%r14)
0000000000012d7f	movsd	-0x50(%rbp), %xmm0
0000000000012d84	addsd	0x10fd1c(%rip), %xmm0
0000000000012d8c	divsd	0x10f894(%rip), %xmm0
0000000000012d94	callq	0xde7ce                         ## symbol stub for: _cos
0000000000012d99	mulsd	-0x30(%rbp), %xmm0
0000000000012d9e	subsd	-0x40(%rbp), %xmm0
0000000000012da3	movsd	%xmm0, (%r15)
0000000000012da8	movsd	(%rbx), %xmm1
0000000000012dac	movsd	(%r14), %xmm2
0000000000012db1	ucomisd	%xmm2, %xmm1
0000000000012db5	jbe	0x12e53
0000000000012dbb	movsd	%xmm2, (%rbx)
0000000000012dbf	movsd	%xmm1, (%r14)
0000000000012dc4	movsd	(%r15), %xmm0
0000000000012dc9	jmp	0x12e57
0000000000012dce	movapd	%xmm5, %xmm2
0000000000012dd2	andpd	0x10f896(%rip), %xmm2
0000000000012dda	subsd	%xmm1, %xmm0
0000000000012dde	sqrtsd	%xmm0, %xmm0
0000000000012de2	addsd	%xmm2, %xmm0
0000000000012de6	movsd	0x10f7fa(%rip), %xmm1
0000000000012dee	movapd	%xmm5, -0x50(%rbp)
0000000000012df3	callq	0xdea4a                         ## symbol stub for: _pow
0000000000012df8	movapd	0x10f870(%rip), %xmm2
0000000000012e00	andpd	%xmm2, %xmm0
0000000000012e04	andnpd	-0x50(%rbp), %xmm2
0000000000012e09	orpd	%xmm0, %xmm2
0000000000012e0d	movapd	0xcf25b(%rip), %xmm1
0000000000012e15	xorpd	%xmm2, %xmm1
0000000000012e19	movapd	%xmm2, %xmm3
0000000000012e1d	cmpltsd	0x10fa5a(%rip), %xmm0
0000000000012e26	movapd	-0x30(%rbp), %xmm2
0000000000012e2b	divsd	%xmm1, %xmm2
0000000000012e2f	andnpd	%xmm2, %xmm0
0000000000012e33	movapd	-0x40(%rbp), %xmm1
0000000000012e38	divsd	0x10f820(%rip), %xmm1
0000000000012e40	subsd	%xmm3, %xmm0
0000000000012e44	addsd	%xmm0, %xmm1
0000000000012e48	movsd	%xmm1, (%rbx)
0000000000012e4c	movl	$0x1, %eax
0000000000012e51	jmp	0x12e84
0000000000012e53	movapd	%xmm2, %xmm1
0000000000012e57	movl	$0x3, %eax
0000000000012e5c	ucomisd	%xmm0, %xmm1
0000000000012e60	jbe	0x12e84
0000000000012e62	movsd	%xmm0, (%r14)
0000000000012e67	movsd	%xmm1, (%r15)
0000000000012e6c	movsd	(%rbx), %xmm0
0000000000012e70	movsd	(%r14), %xmm1
0000000000012e75	ucomisd	%xmm1, %xmm0
0000000000012e79	jbe	0x12e84
0000000000012e7b	movsd	%xmm1, (%rbx)
0000000000012e7f	movsd	%xmm0, (%r14)
0000000000012e84	addq	$0x38, %rsp
0000000000012e88	popq	%rbx
0000000000012e89	popq	%r14
0000000000012e8b	popq	%r15
0000000000012e8d	popq	%rbp
0000000000012e8e	retq
