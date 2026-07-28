__ZN23HGBilateralFilterInterpD0Ev:
0000000000109120	pushq	%rbp
0000000000109121	movq	%rsp, %rbp
0000000000109124	pushq	%rbx
0000000000109125	pushq	%rax
0000000000109126	movq	%rdi, %rbx
0000000000109129	leaq	0x912150(%rip), %rax
0000000000109130	movq	%rax, (%rdi)
0000000000109133	movq	0x1b8(%rdi), %rdi
000000000010913a	movq	(%rdi), %rax
000000000010913d	callq	*0x18(%rax)
0000000000109140	movq	%rbx, %rdi
0000000000109143	callq	__ZN23HGBilateralFilterInterp12DestroyGraphEv ## HGBilateralFilterInterp::DestroyGraph()
0000000000109148	movq	%rbx, %rdi
000000000010914b	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000109150	movq	%rbx, %rdi
0000000000109153	addq	$0x8, %rsp
0000000000109157	popq	%rbx
0000000000109158	popq	%rbp
0000000000109159	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010915e	movq	%rax, %rdi
0000000000109161	callq	___clang_call_terminate
0000000000109166	nopw	%cs:(%rax,%rax)
