__ZN10HGARRILogC6DecodeD0Ev:
0000000000102ad0	pushq	%rbp
0000000000102ad1	movq	%rsp, %rbp
0000000000102ad4	pushq	%rbx
0000000000102ad5	pushq	%rax
0000000000102ad6	movq	%rdi, %rbx
0000000000102ad9	leaq	0x915ce0(%rip), %rax
0000000000102ae0	movq	%rax, (%rdi)
0000000000102ae3	movq	0x198(%rdi), %rdi
0000000000102aea	testq	%rdi, %rdi
0000000000102aed	je	0x102af5
0000000000102aef	movq	(%rdi), %rax
0000000000102af2	callq	*0x18(%rax)
0000000000102af5	movq	0x1a0(%rbx), %rdi
0000000000102afc	testq	%rdi, %rdi
0000000000102aff	je	0x102b07
0000000000102b01	movq	(%rdi), %rax
0000000000102b04	callq	*0x18(%rax)
0000000000102b07	movq	%rbx, %rdi
0000000000102b0a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000102b0f	movq	%rbx, %rdi
0000000000102b12	addq	$0x8, %rsp
0000000000102b16	popq	%rbx
0000000000102b17	popq	%rbp
0000000000102b18	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000102b1d	movq	%rax, %rdi
0000000000102b20	callq	___clang_call_terminate
0000000000102b25	nopw	%cs:(%rax,%rax)
