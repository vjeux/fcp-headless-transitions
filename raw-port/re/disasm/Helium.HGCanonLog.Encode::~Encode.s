__ZN10HGCanonLog6EncodeD0Ev:
0000000000103990	pushq	%rbp
0000000000103991	movq	%rsp, %rbp
0000000000103994	pushq	%rbx
0000000000103995	pushq	%rax
0000000000103996	movq	%rdi, %rbx
0000000000103999	leaq	0x915960(%rip), %rax
00000000001039a0	movq	%rax, (%rdi)
00000000001039a3	movq	0x198(%rdi), %rdi
00000000001039aa	testq	%rdi, %rdi
00000000001039ad	je	0x1039b5
00000000001039af	movq	(%rdi), %rax
00000000001039b2	callq	*0x18(%rax)
00000000001039b5	movq	0x1a0(%rbx), %rdi
00000000001039bc	testq	%rdi, %rdi
00000000001039bf	je	0x1039c7
00000000001039c1	movq	(%rdi), %rax
00000000001039c4	callq	*0x18(%rax)
00000000001039c7	movq	%rbx, %rdi
00000000001039ca	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001039cf	movq	%rbx, %rdi
00000000001039d2	addq	$0x8, %rsp
00000000001039d6	popq	%rbx
00000000001039d7	popq	%rbp
00000000001039d8	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001039dd	movq	%rax, %rdi
00000000001039e0	callq	___clang_call_terminate
00000000001039e5	nopw	%cs:(%rax,%rax)
