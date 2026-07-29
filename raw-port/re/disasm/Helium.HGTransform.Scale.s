__ZN11HGTransform5ScaleEddd:
00000000001b4e30	pushq	%rbp
00000000001b4e31	movq	%rsp, %rbp
00000000001b4e34	pushq	%r14
00000000001b4e36	pushq	%rbx
00000000001b4e37	subq	$0xb0, %rsp
00000000001b4e3e	movsd	%xmm2, -0x28(%rbp)
00000000001b4e43	movsd	%xmm1, -0x20(%rbp)
00000000001b4e48	movsd	%xmm0, -0x18(%rbp)
00000000001b4e4d	movq	%rdi, %rbx
00000000001b4e50	leaq	-0xb8(%rbp), %r14
00000000001b4e57	movq	%r14, %rdi
00000000001b4e5a	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001b4e5f	leaq	0x872332(%rip), %rax
00000000001b4e66	movq	%rax, -0xb8(%rbp)
00000000001b4e6d	xorps	%xmm0, %xmm0
00000000001b4e70	movups	%xmm0, -0x80(%rbp)
00000000001b4e74	movups	%xmm0, -0x60(%rbp)
00000000001b4e78	movups	%xmm0, -0xa0(%rbp)
00000000001b4e7f	movups	%xmm0, -0x90(%rbp)
00000000001b4e86	movups	%xmm0, -0x70(%rbp)
00000000001b4e8a	movups	%xmm0, -0x50(%rbp)
00000000001b4e8e	movups	%xmm0, -0x40(%rbp)
00000000001b4e92	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b4e9c	movq	%rax, -0x30(%rbp)
00000000001b4ea0	movsd	-0x18(%rbp), %xmm0
00000000001b4ea5	movsd	%xmm0, -0xa8(%rbp)
00000000001b4ead	movsd	-0x20(%rbp), %xmm0
00000000001b4eb2	movsd	%xmm0, -0x80(%rbp)
00000000001b4eb7	movsd	-0x28(%rbp), %xmm0
00000000001b4ebc	movsd	%xmm0, -0x58(%rbp)
00000000001b4ec1	movq	(%rbx), %rax
00000000001b4ec4	movq	%rbx, %rdi
00000000001b4ec7	movq	%r14, %rsi
00000000001b4eca	callq	*0xc0(%rax)
00000000001b4ed0	leaq	-0xb8(%rbp), %rdi
00000000001b4ed7	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b4edc	addq	$0xb0, %rsp
00000000001b4ee3	popq	%rbx
00000000001b4ee4	popq	%r14
00000000001b4ee6	popq	%rbp
00000000001b4ee7	retq
00000000001b4ee8	movq	%rax, %rbx
00000000001b4eeb	leaq	-0xb8(%rbp), %rdi
00000000001b4ef2	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b4ef7	movq	%rbx, %rdi
00000000001b4efa	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b4eff	nop
