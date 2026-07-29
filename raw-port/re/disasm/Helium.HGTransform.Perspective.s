__ZN11HGTransform11PerspectiveEdd:
00000000001b4f00	pushq	%rbp
00000000001b4f01	movq	%rsp, %rbp
00000000001b4f04	pushq	%rbx
00000000001b4f05	subq	$0xa8, %rsp
00000000001b4f0c	movsd	%xmm1, -0x10(%rbp)
00000000001b4f11	movsd	%xmm0, -0x18(%rbp)
00000000001b4f16	movq	%rdi, %rbx
00000000001b4f19	leaq	-0xa8(%rbp), %rdi
00000000001b4f20	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001b4f25	leaq	0x87226c(%rip), %rax
00000000001b4f2c	movq	%rax, -0xa8(%rbp)
00000000001b4f33	xorps	%xmm0, %xmm0
00000000001b4f36	movups	%xmm0, -0x70(%rbp)
00000000001b4f3a	movups	%xmm0, -0x50(%rbp)
00000000001b4f3e	movups	%xmm0, -0x90(%rbp)
00000000001b4f45	movups	%xmm0, -0x80(%rbp)
00000000001b4f49	movups	%xmm0, -0x60(%rbp)
00000000001b4f4d	movups	%xmm0, -0x40(%rbp)
00000000001b4f51	movups	%xmm0, -0x30(%rbp)
00000000001b4f55	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b4f5f	movq	%rax, -0x98(%rbp)
00000000001b4f66	movq	%rax, -0x70(%rbp)
00000000001b4f6a	movq	%rax, -0x48(%rbp)
00000000001b4f6e	movq	%rax, -0x20(%rbp)
00000000001b4f72	movsd	-0x18(%rbp), %xmm0
00000000001b4f77	mulsd	0x6a8429(%rip), %xmm0
00000000001b4f7f	callq	0x3c5642                        ## symbol stub for: _tan
00000000001b4f84	cvtsd2ss	%xmm0, %xmm0
00000000001b4f88	cvtss2sd	%xmm0, %xmm0
00000000001b4f8c	addsd	%xmm0, %xmm0
00000000001b4f90	xorpd	%xmm1, %xmm1
00000000001b4f94	ucomisd	%xmm1, %xmm0
00000000001b4f98	jne	0x1b4f9c
00000000001b4f9a	jnp	0x1b4fe7
00000000001b4f9c	movsd	-0x10(%rbp), %xmm3
00000000001b4fa1	movapd	%xmm3, %xmm1
00000000001b4fa5	divsd	%xmm0, %xmm1
00000000001b4fa9	addsd	0x2152af(%rip), %xmm1
00000000001b4fb1	movsd	%xmm1, -0x48(%rbp)
00000000001b4fb6	movapd	0x215b22(%rip), %xmm2
00000000001b4fbe	xorpd	%xmm2, %xmm0
00000000001b4fc2	divsd	%xmm3, %xmm0
00000000001b4fc6	movsd	%xmm0, -0x40(%rbp)
00000000001b4fcb	xorpd	%xmm2, %xmm1
00000000001b4fcf	movlpd	%xmm1, -0x28(%rbp)
00000000001b4fd4	movq	(%rbx), %rax
00000000001b4fd7	leaq	-0xa8(%rbp), %rsi
00000000001b4fde	movq	%rbx, %rdi
00000000001b4fe1	callq	*0xc0(%rax)
00000000001b4fe7	leaq	-0xa8(%rbp), %rdi
00000000001b4fee	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b4ff3	addq	$0xa8, %rsp
00000000001b4ffa	popq	%rbx
00000000001b4ffb	popq	%rbp
00000000001b4ffc	retq
00000000001b4ffd	movq	%rax, %rbx
00000000001b5000	leaq	-0xa8(%rbp), %rdi
00000000001b5007	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b500c	movq	%rbx, %rdi
00000000001b500f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b5014	nopw	%cs:(%rax,%rax)
