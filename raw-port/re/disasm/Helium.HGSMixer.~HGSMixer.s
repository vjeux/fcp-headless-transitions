__ZN8HGSMixerD0Ev:
00000000000400f0	pushq	%rbp
00000000000400f1	movq	%rsp, %rbp
00000000000400f4	pushq	%rbx
00000000000400f5	pushq	%rax
00000000000400f6	movq	%rdi, %rbx
00000000000400f9	callq	__ZN9HgcSMixerD2Ev              ## HgcSMixer::~HgcSMixer()
00000000000400fe	movq	%rbx, %rdi
0000000000040101	addq	$0x8, %rsp
0000000000040105	popq	%rbx
0000000000040106	popq	%rbp
0000000000040107	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000004010c	nopl	(%rax)
