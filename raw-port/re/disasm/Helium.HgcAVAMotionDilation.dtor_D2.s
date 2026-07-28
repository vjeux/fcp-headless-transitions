__ZN20HgcAVAMotionDilationD2Ev:
00000000002167e0	leaq	0x819a01(%rip), %rax
00000000002167e7	movq	%rax, (%rdi)
00000000002167ea	movq	0x198(%rdi), %rax
00000000002167f1	testq	%rax, %rax
00000000002167f4	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002167fa	movq	-0x8(%rax), %rax
00000000002167fe	testq	%rax, %rax
0000000000216801	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000216807	pushq	%rbp
0000000000216808	movq	%rsp, %rbp
000000000021680b	pushq	%rbx
000000000021680c	pushq	%rax
000000000021680d	movq	%rdi, %rbx
0000000000216810	movq	%rax, %rdi
0000000000216813	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000216818	movq	%rbx, %rdi
000000000021681b	addq	$0x8, %rsp
000000000021681f	popq	%rbx
0000000000216820	popq	%rbp
0000000000216821	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000216826	nopw	%cs:(%rax,%rax)
