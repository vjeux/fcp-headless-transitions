__ZN11HGTransformC1Ev:
00000000001b41d0	pushq	%rbp
00000000001b41d1	movq	%rsp, %rbp
00000000001b41d4	pushq	%rbx
00000000001b41d5	pushq	%rax
00000000001b41d6	movq	%rdi, %rbx
00000000001b41d9	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001b41de	leaq	0x872fb3(%rip), %rax
00000000001b41e5	movq	%rax, (%rbx)
00000000001b41e8	xorps	%xmm0, %xmm0
00000000001b41eb	movups	%xmm0, 0x38(%rbx)
00000000001b41ef	movups	%xmm0, 0x58(%rbx)
00000000001b41f3	movups	%xmm0, 0x18(%rbx)
00000000001b41f7	movups	%xmm0, 0x28(%rbx)
00000000001b41fb	movups	%xmm0, 0x48(%rbx)
00000000001b41ff	movups	%xmm0, 0x68(%rbx)
00000000001b4203	movups	%xmm0, 0x78(%rbx)
00000000001b4207	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b4211	movq	%rax, 0x10(%rbx)
00000000001b4215	movq	%rax, 0x38(%rbx)
00000000001b4219	movq	%rax, 0x60(%rbx)
00000000001b421d	movq	%rax, 0x88(%rbx)
00000000001b4224	addq	$0x8, %rsp
00000000001b4228	popq	%rbx
00000000001b4229	popq	%rbp
00000000001b422a	retq
00000000001b422b	nopl	(%rax,%rax)
