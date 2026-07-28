__ZN10HGAnaglyphD0Ev:
000000000006f4c0	pushq	%rbp
000000000006f4c1	movq	%rsp, %rbp
000000000006f4c4	pushq	%rbx
000000000006f4c5	pushq	%rax
000000000006f4c6	movq	%rdi, %rbx
000000000006f4c9	leaq	0x999210(%rip), %rax
000000000006f4d0	movq	%rax, (%rdi)
000000000006f4d3	movq	0x198(%rdi), %rdi
000000000006f4da	testq	%rdi, %rdi
000000000006f4dd	je	0x6f4e5
000000000006f4df	movq	(%rdi), %rax
000000000006f4e2	callq	*0x18(%rax)
000000000006f4e5	movq	%rbx, %rdi
000000000006f4e8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000006f4ed	movq	%rbx, %rdi
000000000006f4f0	addq	$0x8, %rsp
000000000006f4f4	popq	%rbx
000000000006f4f5	popq	%rbp
000000000006f4f6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000006f4fb	movq	%rax, %rdi
000000000006f4fe	callq	___clang_call_terminate
000000000006f503	nopw	%cs:(%rax,%rax)
