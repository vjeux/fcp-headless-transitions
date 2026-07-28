__ZN20HgcAVAMotionDilationD1Ev:
0000000000216830	leaq	0x8199b1(%rip), %rax
0000000000216837	movq	%rax, (%rdi)
000000000021683a	movq	0x198(%rdi), %rax
0000000000216841	testq	%rax, %rax
0000000000216844	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000021684a	movq	-0x8(%rax), %rax
000000000021684e	testq	%rax, %rax
0000000000216851	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000216857	pushq	%rbp
0000000000216858	movq	%rsp, %rbp
000000000021685b	pushq	%rbx
000000000021685c	pushq	%rax
000000000021685d	movq	%rdi, %rbx
0000000000216860	movq	%rax, %rdi
0000000000216863	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000216868	movq	%rbx, %rdi
000000000021686b	addq	$0x8, %rsp
000000000021686f	popq	%rbx
0000000000216870	popq	%rbp
0000000000216871	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000216876	nopw	%cs:(%rax,%rax)
