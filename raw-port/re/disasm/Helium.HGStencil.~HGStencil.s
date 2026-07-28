__ZN9HGStencilD0Ev:
00000000002d1e80	pushq	%rbp
00000000002d1e81	movq	%rsp, %rbp
00000000002d1e84	pushq	%r14
00000000002d1e86	pushq	%rbx
00000000002d1e87	movq	%rdi, %rbx
00000000002d1e8a	leaq	0x76741f(%rip), %rax
00000000002d1e91	movq	%rax, (%rdi)
00000000002d1e94	movq	0x198(%rdi), %rdi
00000000002d1e9b	movq	0x1a0(%rbx), %r14
00000000002d1ea2	subq	%rdi, %r14
00000000002d1ea5	shrq	$0x3, %r14
00000000002d1ea9	testl	%r14d, %r14d
00000000002d1eac	jle	0x2d1ef1
00000000002d1eae	andl	$0x7fffffff, %r14d              ## imm = 0x7FFFFFFF
00000000002d1eb5	incq	%r14
00000000002d1eb8	jmp	0x2d1ec9
00000000002d1eba	nopw	(%rax,%rax)
00000000002d1ec0	decq	%r14
00000000002d1ec3	cmpq	$0x1, %r14
00000000002d1ec7	jbe	0x2d1eea
00000000002d1ec9	movq	0x198(%rbx), %rax
00000000002d1ed0	movq	-0x10(%rax,%r14,8), %rax
00000000002d1ed5	testq	%rax, %rax
00000000002d1ed8	je	0x2d1ec0
00000000002d1eda	movq	-0x8(%rax), %rdi
00000000002d1ede	testq	%rdi, %rdi
00000000002d1ee1	je	0x2d1ec0
00000000002d1ee3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002d1ee8	jmp	0x2d1ec0
00000000002d1eea	movq	0x198(%rbx), %rdi
00000000002d1ef1	testq	%rdi, %rdi
00000000002d1ef4	je	0x2d1f02
00000000002d1ef6	movq	%rdi, 0x1a0(%rbx)
00000000002d1efd	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002d1f02	movq	%rbx, %rdi
00000000002d1f05	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002d1f0a	movq	%rbx, %rdi
00000000002d1f0d	popq	%rbx
00000000002d1f0e	popq	%r14
00000000002d1f10	popq	%rbp
00000000002d1f11	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000002d1f16	nopw	%cs:(%rax,%rax)
