__ZN13HGOutputClampD0Ev:
00000000001acab0	pushq	%rbp
00000000001acab1	movq	%rsp, %rbp
00000000001acab4	pushq	%rbx
00000000001acab5	pushq	%rax
00000000001acab6	movq	%rdi, %rbx
00000000001acab9	leaq	0x8799a8(%rip), %rax
00000000001acac0	movq	%rax, (%rdi)
00000000001acac3	movq	0x1a0(%rdi), %rdi
00000000001acaca	testq	%rdi, %rdi
00000000001acacd	je	0x1acad5
00000000001acacf	movq	(%rdi), %rax
00000000001acad2	callq	*0x18(%rax)
00000000001acad5	movq	%rbx, %rdi
00000000001acad8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001acadd	movq	%rbx, %rdi
00000000001acae0	addq	$0x8, %rsp
00000000001acae4	popq	%rbx
00000000001acae5	popq	%rbp
00000000001acae6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001acaeb	movq	%rax, %rdi
00000000001acaee	callq	___clang_call_terminate
00000000001acaf3	nopw	%cs:(%rax,%rax)
