__ZN15HGComputeDeltaED0Ev:
00000000000938e0	pushq	%rbp
00000000000938e1	movq	%rsp, %rbp
00000000000938e4	pushq	%rbx
00000000000938e5	pushq	%rax
00000000000938e6	movq	%rdi, %rbx
00000000000938e9	leaq	0x977ac8(%rip), %rax
00000000000938f0	movq	%rax, (%rdi)
00000000000938f3	movq	0x1a8(%rdi), %rdi
00000000000938fa	testq	%rdi, %rdi
00000000000938fd	je	0x93905
00000000000938ff	movq	(%rdi), %rax
0000000000093902	callq	*0x18(%rax)
0000000000093905	movq	%rbx, %rdi
0000000000093908	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000009390d	movq	%rbx, %rdi
0000000000093910	addq	$0x8, %rsp
0000000000093914	popq	%rbx
0000000000093915	popq	%rbp
0000000000093916	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000009391b	movq	%rax, %rdi
000000000009391e	callq	___clang_call_terminate
0000000000093923	nopw	%cs:(%rax,%rax)
