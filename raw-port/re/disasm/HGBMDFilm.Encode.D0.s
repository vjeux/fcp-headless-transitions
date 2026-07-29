__ZN9HGBMDFilm6EncodeD0Ev:
0000000000103390	pushq	%rbp
0000000000103391	movq	%rsp, %rbp
0000000000103394	pushq	%rbx
0000000000103395	pushq	%rax
0000000000103396	movq	%rdi, %rbx
0000000000103399	leaq	0x915ae0(%rip), %rax
00000000001033a0	movq	%rax, (%rdi)
00000000001033a3	movq	0x198(%rdi), %rdi
00000000001033aa	testq	%rdi, %rdi
00000000001033ad	je	0x1033b5
00000000001033af	movq	(%rdi), %rax
00000000001033b2	callq	*0x18(%rax)
00000000001033b5	movq	0x1a0(%rbx), %rdi
00000000001033bc	testq	%rdi, %rdi
00000000001033bf	je	0x1033c7
00000000001033c1	movq	(%rdi), %rax
00000000001033c4	callq	*0x18(%rax)
00000000001033c7	movq	%rbx, %rdi
00000000001033ca	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001033cf	movq	%rbx, %rdi
00000000001033d2	addq	$0x8, %rsp
00000000001033d6	popq	%rbx
00000000001033d7	popq	%rbp
00000000001033d8	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001033dd	movq	%rax, %rdi
00000000001033e0	callq	___clang_call_terminate
00000000001033e5	nopw	%cs:(%rax,%rax)
