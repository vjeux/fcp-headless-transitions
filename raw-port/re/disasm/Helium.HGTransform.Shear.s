__ZN11HGTransform5ShearEdddd:
00000000001b4c70	pushq	%rbp
00000000001b4c71	movq	%rsp, %rbp
00000000001b4c74	pushq	%r14
00000000001b4c76	pushq	%rbx
00000000001b4c77	subq	$0xd0, %rsp
00000000001b4c7e	movsd	%xmm3, -0x20(%rbp)
00000000001b4c83	movaps	%xmm2, -0x40(%rbp)
00000000001b4c87	movaps	%xmm1, -0x30(%rbp)
00000000001b4c8b	movq	%rdi, %rbx
00000000001b4c8e	mulsd	0x6a870a(%rip), %xmm0
00000000001b4c96	callq	0x3c5024                        ## symbol stub for: ___sincos_stret
00000000001b4c9b	cvtsd2ss	%xmm0, %xmm0
00000000001b4c9f	xorps	%xmm2, %xmm2
00000000001b4ca2	ucomiss	%xmm2, %xmm0
00000000001b4ca5	jne	0x1b4cad
00000000001b4ca7	jnp	0x1b4e06
00000000001b4cad	cvtsd2ss	%xmm1, %xmm1
00000000001b4cb1	ucomiss	%xmm2, %xmm1
00000000001b4cb4	jne	0x1b4cbc
00000000001b4cb6	jnp	0x1b4e06
00000000001b4cbc	movapd	-0x30(%rbp), %xmm2
00000000001b4cc1	movapd	%xmm2, %xmm3
00000000001b4cc5	mulsd	%xmm2, %xmm3
00000000001b4cc9	movapd	-0x40(%rbp), %xmm4
00000000001b4cce	mulsd	%xmm4, %xmm4
00000000001b4cd2	movsd	-0x20(%rbp), %xmm5
00000000001b4cd7	mulsd	%xmm5, %xmm5
00000000001b4cdb	addsd	%xmm3, %xmm4
00000000001b4cdf	addsd	%xmm5, %xmm4
00000000001b4ce3	ucomisd	0x215575(%rip), %xmm4
00000000001b4ceb	unpcklpd	%xmm2, %xmm3                    ## xmm3 = xmm3[0],xmm2[0]
00000000001b4cef	jne	0x1b4cf3
00000000001b4cf1	jnp	0x1b4d16
00000000001b4cf3	xorpd	%xmm2, %xmm2
00000000001b4cf7	ucomisd	%xmm2, %xmm4
00000000001b4cfb	jne	0x1b4d03
00000000001b4cfd	jnp	0x1b4e06
00000000001b4d03	movapd	%xmm4, %xmm5
00000000001b4d07	xorps	%xmm2, %xmm2
00000000001b4d0a	sqrtsd	%xmm4, %xmm2
00000000001b4d0e	unpcklpd	%xmm2, %xmm5                    ## xmm5 = xmm5[0],xmm2[0]
00000000001b4d12	divpd	%xmm5, %xmm3
00000000001b4d16	movapd	%xmm3, -0x30(%rbp)
00000000001b4d1b	cvtss2sd	%xmm0, %xmm0
00000000001b4d1f	movaps	%xmm0, -0x20(%rbp)
00000000001b4d23	xorps	%xmm0, %xmm0
00000000001b4d26	cvtss2sd	%xmm1, %xmm0
00000000001b4d2a	movsd	%xmm0, -0x40(%rbp)
00000000001b4d2f	unpckhpd	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
00000000001b4d33	movapd	%xmm3, -0x50(%rbp)
00000000001b4d38	leaq	-0xe0(%rbp), %r14
00000000001b4d3f	movq	%r14, %rdi
00000000001b4d42	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001b4d47	leaq	0x87244a(%rip), %rax
00000000001b4d4e	movq	%rax, -0xe0(%rbp)
00000000001b4d55	xorps	%xmm0, %xmm0
00000000001b4d58	movups	%xmm0, -0xa8(%rbp)
00000000001b4d5f	movups	%xmm0, -0x88(%rbp)
00000000001b4d66	movups	%xmm0, -0xb8(%rbp)
00000000001b4d6d	movups	%xmm0, -0xc8(%rbp)
00000000001b4d74	movups	%xmm0, -0x98(%rbp)
00000000001b4d7b	movups	%xmm0, -0x78(%rbp)
00000000001b4d7f	movups	%xmm0, -0x68(%rbp)
00000000001b4d83	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b4d8d	movq	%rax, -0xd0(%rbp)
00000000001b4d94	movq	%rax, -0xa8(%rbp)
00000000001b4d9b	movapd	0x215d3d(%rip), %xmm1
00000000001b4da3	movapd	-0x20(%rbp), %xmm3
00000000001b4da8	xorpd	%xmm3, %xmm1
00000000001b4dac	xorpd	%xmm2, %xmm2
00000000001b4db0	movapd	-0x50(%rbp), %xmm0
00000000001b4db5	cmpltsd	%xmm2, %xmm0
00000000001b4dba	movapd	%xmm1, %xmm2
00000000001b4dbe	blendvpd	%xmm0, %xmm3, %xmm2
00000000001b4dc3	movapd	-0x30(%rbp), %xmm0
00000000001b4dc8	cmpeqsd	0x21548f(%rip), %xmm0
00000000001b4dd1	movq	%rax, -0x80(%rbp)
00000000001b4dd5	blendvpd	%xmm0, %xmm2, %xmm1
00000000001b4dda	movq	%rax, -0x58(%rbp)
00000000001b4dde	divsd	-0x40(%rbp), %xmm1
00000000001b4de3	movsd	%xmm1, -0xb0(%rbp)
00000000001b4deb	movq	(%rbx), %rax
00000000001b4dee	movq	%rbx, %rdi
00000000001b4df1	movq	%r14, %rsi
00000000001b4df4	callq	*0xc0(%rax)
00000000001b4dfa	leaq	-0xe0(%rbp), %rdi
00000000001b4e01	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b4e06	addq	$0xd0, %rsp
00000000001b4e0d	popq	%rbx
00000000001b4e0e	popq	%r14
00000000001b4e10	popq	%rbp
00000000001b4e11	retq
00000000001b4e12	movq	%rax, %rbx
00000000001b4e15	leaq	-0xe0(%rbp), %rdi
00000000001b4e1c	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b4e21	movq	%rbx, %rdi
00000000001b4e24	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b4e29	nopl	(%rax)
