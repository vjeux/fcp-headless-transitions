__ZN12HGRegularizeD0Ev:
00000000001c3530	pushq	%rbp
00000000001c3531	movq	%rsp, %rbp
00000000001c3534	pushq	%r14
00000000001c3536	pushq	%rbx
00000000001c3537	movq	%rdi, %rbx
00000000001c353a	leaq	0x86560f(%rip), %rax
00000000001c3541	movq	%rax, (%rdi)
00000000001c3544	xorl	%r14d, %r14d
00000000001c3547	nopw	(%rax,%rax)
00000000001c3550	movq	0x1a0(%rbx), %rax
00000000001c3557	movq	(%rax,%r14,8), %rdi
00000000001c355b	movq	(%rdi), %rax
00000000001c355e	callq	*0x18(%rax)
00000000001c3561	incq	%r14
00000000001c3564	cmpq	$0xc8, %r14
00000000001c356b	jne	0x1c3550
00000000001c356d	movq	0x198(%rbx), %rdi
00000000001c3574	movq	(%rdi), %rax
00000000001c3577	callq	*0x18(%rax)
00000000001c357a	movq	0x1a0(%rbx), %rdi
00000000001c3581	testq	%rdi, %rdi
00000000001c3584	je	0x1c358b
00000000001c3586	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001c358b	movq	%rbx, %rdi
00000000001c358e	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001c3593	movq	%rbx, %rdi
00000000001c3596	popq	%rbx
00000000001c3597	popq	%r14
00000000001c3599	popq	%rbp
00000000001c359a	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c359f	movq	%rax, %rdi
00000000001c35a2	callq	___clang_call_terminate
00000000001c35a7	movq	%rax, %rdi
00000000001c35aa	callq	___clang_call_terminate
00000000001c35af	nop
