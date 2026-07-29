__ZN15HGPanasonicVLog6EncodeD0Ev:
0000000000104600	pushq	%rbp
0000000000104601	movq	%rsp, %rbp
0000000000104604	pushq	%rbx
0000000000104605	pushq	%rax
0000000000104606	movq	%rdi, %rbx
0000000000104609	leaq	0x9155f0(%rip), %rax
0000000000104610	movq	%rax, (%rdi)
0000000000104613	movq	0x198(%rdi), %rdi
000000000010461a	testq	%rdi, %rdi
000000000010461d	je	0x104625
000000000010461f	movq	(%rdi), %rax
0000000000104622	callq	*0x18(%rax)
0000000000104625	movq	0x1a0(%rbx), %rdi
000000000010462c	testq	%rdi, %rdi
000000000010462f	je	0x104637
0000000000104631	movq	(%rdi), %rax
0000000000104634	callq	*0x18(%rax)
0000000000104637	movq	%rbx, %rdi
000000000010463a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000010463f	movq	%rbx, %rdi
0000000000104642	addq	$0x8, %rsp
0000000000104646	popq	%rbx
0000000000104647	popq	%rbp
0000000000104648	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010464d	movq	%rax, %rdi
0000000000104650	callq	___clang_call_terminate
0000000000104655	nopw	%cs:(%rax,%rax)
