__ZN18HGComicColorStrokeD0Ev:
00000000001bc120	pushq	%rbp
00000000001bc121	movq	%rsp, %rbp
00000000001bc124	pushq	%rbx
00000000001bc125	pushq	%rax
00000000001bc126	movq	%rdi, %rbx
00000000001bc129	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001bc12e	movq	%rbx, %rdi
00000000001bc131	addq	$0x8, %rsp
00000000001bc135	popq	%rbx
00000000001bc136	popq	%rbp
00000000001bc137	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001bc13c	nopl	(%rax)
