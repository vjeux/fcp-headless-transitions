__ZN9HGStencilC2Ev:
00000000002d1c70	pushq	%rbp
00000000002d1c71	movq	%rsp, %rbp
00000000002d1c74	pushq	%r15
00000000002d1c76	pushq	%r14
00000000002d1c78	pushq	%rbx
00000000002d1c79	pushq	%rax
00000000002d1c7a	movq	%rdi, %rbx
00000000002d1c7d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000002d1c82	leaq	0x767627(%rip), %rax
00000000002d1c89	movq	%rax, (%rbx)
00000000002d1c8c	leaq	0x198(%rbx), %r15
00000000002d1c93	xorps	%xmm0, %xmm0
00000000002d1c96	movups	%xmm0, 0x198(%rbx)
00000000002d1c9d	movq	$0x0, 0x1a8(%rbx)
00000000002d1ca8	movq	$0x3f800000, 0x1b0(%rbx)        ## imm = 0x3F800000
00000000002d1cb3	movq	%rbx, %rdi
00000000002d1cb6	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000002d1cbb	movl	$0x200, %edx                    ## imm = 0x200
00000000002d1cc0	callq	__ZN6HGNode10ClearFlagsEii      ## HGNode::ClearFlags(int, int)
00000000002d1cc5	movq	(%rbx), %rax
00000000002d1cc8	movq	%rbx, %rdi
00000000002d1ccb	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000002d1cd0	movl	$0x400, %edx                    ## imm = 0x400
00000000002d1cd5	callq	*0x88(%rax)
00000000002d1cdb	movq	(%rbx), %rax
00000000002d1cde	movq	%rbx, %rdi
00000000002d1ce1	xorl	%esi, %esi
00000000002d1ce3	movl	$0x20, %edx
00000000002d1ce8	callq	*0x88(%rax)
00000000002d1cee	movq	(%rbx), %rax
00000000002d1cf1	movq	%rbx, %rdi
00000000002d1cf4	movl	$0x1, %esi
00000000002d1cf9	movl	$0x20, %edx
00000000002d1cfe	callq	*0x88(%rax)
00000000002d1d04	movq	(%rbx), %rax
00000000002d1d07	movq	%rbx, %rdi
00000000002d1d0a	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000002d1d0f	movl	$0x20, %edx
00000000002d1d14	callq	*0x88(%rax)
00000000002d1d1a	addq	$0x8, %rsp
00000000002d1d1e	popq	%rbx
00000000002d1d1f	popq	%r14
00000000002d1d21	popq	%r15
00000000002d1d23	popq	%rbp
00000000002d1d24	retq
00000000002d1d25	movq	%rax, %r14
00000000002d1d28	movq	(%r15), %rdi
00000000002d1d2b	testq	%rdi, %rdi
00000000002d1d2e	je	0x2d1d3c
00000000002d1d30	movq	%rdi, 0x1a0(%rbx)
00000000002d1d37	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002d1d3c	movq	%rbx, %rdi
00000000002d1d3f	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002d1d44	movq	%r14, %rdi
00000000002d1d47	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000002d1d4c	nopl	(%rax)
