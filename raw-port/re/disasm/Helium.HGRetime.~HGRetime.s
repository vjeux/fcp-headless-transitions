__ZN8HGRetimeD0Ev:
0000000000193ec0	pushq	%rbp
0000000000193ec1	movq	%rsp, %rbp
0000000000193ec4	pushq	%rbx
0000000000193ec5	pushq	%rax
0000000000193ec6	movq	%rdi, %rbx
0000000000193ec9	leaq	0x88fd10(%rip), %rax
0000000000193ed0	movq	%rax, (%rdi)
0000000000193ed3	movq	0x1b8(%rdi), %rdi
0000000000193eda	testq	%rdi, %rdi
0000000000193edd	je	0x193ee5
0000000000193edf	movq	(%rdi), %rax
0000000000193ee2	callq	*0x18(%rax)
0000000000193ee5	movq	%rbx, %rdi
0000000000193ee8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000193eed	movq	%rbx, %rdi
0000000000193ef0	addq	$0x8, %rsp
0000000000193ef4	popq	%rbx
0000000000193ef5	popq	%rbp
0000000000193ef6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000193efb	movq	%rax, %rdi
0000000000193efe	callq	___clang_call_terminate
0000000000193f03	nopw	%cs:(%rax,%rax)
