__ZN11HGTransform9TranslateEddd:
00000000001b4910	pushq	%rbp
00000000001b4911	movq	%rsp, %rbp
00000000001b4914	pushq	%r14
00000000001b4916	pushq	%rbx
00000000001b4917	subq	$0xb0, %rsp
00000000001b491e	movsd	%xmm2, -0x28(%rbp)
00000000001b4923	movsd	%xmm1, -0x20(%rbp)
00000000001b4928	movsd	%xmm0, -0x18(%rbp)
00000000001b492d	movq	%rdi, %rbx
00000000001b4930	leaq	-0xb8(%rbp), %r14
00000000001b4937	movq	%r14, %rdi
00000000001b493a	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001b493f	leaq	0x872852(%rip), %rax
00000000001b4946	movq	%rax, -0xb8(%rbp)
00000000001b494d	xorps	%xmm0, %xmm0
00000000001b4950	movups	%xmm0, -0x80(%rbp)
00000000001b4954	movups	%xmm0, -0x60(%rbp)
00000000001b4958	movups	%xmm0, -0xa0(%rbp)
00000000001b495f	movups	%xmm0, -0x90(%rbp)
00000000001b4966	movups	%xmm0, -0x70(%rbp)
00000000001b496a	movq	$0x0, -0x50(%rbp)
00000000001b4972	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b497c	movq	%rax, -0xa8(%rbp)
00000000001b4983	movq	%rax, -0x80(%rbp)
00000000001b4987	movq	%rax, -0x58(%rbp)
00000000001b498b	movq	%rax, -0x30(%rbp)
00000000001b498f	movsd	-0x18(%rbp), %xmm0
00000000001b4994	movsd	%xmm0, -0x48(%rbp)
00000000001b4999	movsd	-0x20(%rbp), %xmm0
00000000001b499e	movsd	%xmm0, -0x40(%rbp)
00000000001b49a3	movsd	-0x28(%rbp), %xmm0
00000000001b49a8	movsd	%xmm0, -0x38(%rbp)
00000000001b49ad	movq	(%rbx), %rax
00000000001b49b0	movq	%rbx, %rdi
00000000001b49b3	movq	%r14, %rsi
00000000001b49b6	callq	*0xc0(%rax)
00000000001b49bc	leaq	-0xb8(%rbp), %rdi
00000000001b49c3	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b49c8	addq	$0xb0, %rsp
00000000001b49cf	popq	%rbx
00000000001b49d0	popq	%r14
00000000001b49d2	popq	%rbp
00000000001b49d3	retq
00000000001b49d4	movq	%rax, %rbx
00000000001b49d7	leaq	-0xb8(%rbp), %rdi
00000000001b49de	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001b49e3	movq	%rbx, %rdi
00000000001b49e6	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b49eb	nopl	(%rax,%rax)
