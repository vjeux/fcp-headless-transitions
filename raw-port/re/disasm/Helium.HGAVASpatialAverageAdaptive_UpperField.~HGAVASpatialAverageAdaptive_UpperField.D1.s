__ZN38HGAVASpatialAverageAdaptive_UpperFieldD1Ev:
0000000000222010	leaq	0x80ed11(%rip), %rax
0000000000222017	movq	%rax, (%rdi)
000000000022201a	movq	0x198(%rdi), %rax
0000000000222021	testq	%rax, %rax
0000000000222024	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000022202a	movq	-0x8(%rax), %rax
000000000022202e	testq	%rax, %rax
0000000000222031	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000222037	pushq	%rbp
0000000000222038	movq	%rsp, %rbp
000000000022203b	pushq	%rbx
000000000022203c	pushq	%rax
000000000022203d	movq	%rdi, %rbx
0000000000222040	movq	%rax, %rdi
0000000000222043	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000222048	movq	%rbx, %rdi
000000000022204b	addq	$0x8, %rsp
000000000022204f	popq	%rbx
0000000000222050	popq	%rbp
0000000000222051	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000222056	nopw	%cs:(%rax,%rax)
