__ZN13MXFH264Parser8parsePPSEPKhi:
0000000001420fb0	pushq	%rbp
0000000001420fb1	movq	%rsp, %rbp
0000000001420fb4	pushq	%r15
0000000001420fb6	pushq	%r14
0000000001420fb8	pushq	%rbx
0000000001420fb9	subq	$0x38, %rsp
0000000001420fbd	leaq	-0x50(%rbp), %rbx
0000000001420fc1	movq	%rbx, %rdi
0000000001420fc4	callq	__ZN9VlcParser10initializeEPKhi ## VlcParser::initialize(unsigned char const*, int)
0000000001420fc9	movq	%rbx, %rdi
0000000001420fcc	movl	$0x3, %esi
0000000001420fd1	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420fd6	movq	%rbx, %rdi
0000000001420fd9	movl	$0x5, %esi
0000000001420fde	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420fe3	movq	%rbx, %rdi
0000000001420fe6	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420feb	movq	%rbx, %rdi
0000000001420fee	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420ff3	movq	%rbx, %rdi
0000000001420ff6	movl	$0x1, %esi
0000000001420ffb	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001421000	movq	%rbx, %rdi
0000000001421003	movl	$0x1, %esi
0000000001421008	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
000000000142100d	movq	%rbx, %rdi
0000000001421010	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001421015	testl	%eax, %eax
0000000001421017	jle	0x14210cf
000000000142101d	movl	%eax, %ebx
000000000142101f	leaq	-0x50(%rbp), %rdi
0000000001421023	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001421028	testl	%eax, %eax
000000000142102a	je	0x1421056
000000000142102c	cmpl	$0x2, %eax
000000000142102f	jne	0x142106e
0000000001421031	incl	%ebx
0000000001421033	leaq	-0x50(%rbp), %r14
0000000001421037	nopw	(%rax,%rax)
0000000001421040	movq	%r14, %rdi
0000000001421043	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001421048	movq	%r14, %rdi
000000000142104b	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001421050	decl	%ebx
0000000001421052	jne	0x1421040
0000000001421054	jmp	0x14210cf
0000000001421056	subl	%eax, %ebx
0000000001421058	incl	%ebx
000000000142105a	leaq	-0x50(%rbp), %r14
000000000142105e	nop
0000000001421060	movq	%r14, %rdi
0000000001421063	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001421068	decl	%ebx
000000000142106a	jne	0x1421060
000000000142106c	jmp	0x14210cf
000000000142106e	leal	-0x3(%rax), %ecx
0000000001421071	cmpl	$0x2, %ecx
0000000001421074	ja	0x1421091
0000000001421076	leaq	-0x50(%rbp), %rbx
000000000142107a	movq	%rbx, %rdi
000000000142107d	movl	$0x1, %esi
0000000001421082	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001421087	movq	%rbx, %rdi
000000000142108a	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
000000000142108f	jmp	0x14210cf
0000000001421091	cmpl	$0x6, %eax
0000000001421094	jne	0x14210cf
0000000001421096	leaq	-0x50(%rbp), %rdi
000000000142109a	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
000000000142109f	incl	%ebx
00000000014210a1	movl	%ebx, -0x1c(%rbp)
00000000014210a4	bsrl	-0x1c(%rbp), %ebx
00000000014210a8	testl	%eax, %eax
00000000014210aa	js	0x14210cf
00000000014210ac	movl	%eax, %r14d
00000000014210af	incl	%ebx
00000000014210b1	incl	%r14d
00000000014210b4	leaq	-0x50(%rbp), %r15
00000000014210b8	nopl	(%rax,%rax)
00000000014210c0	movq	%r15, %rdi
00000000014210c3	movl	%ebx, %esi
00000000014210c5	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
00000000014210ca	decl	%r14d
00000000014210cd	jne	0x14210c0
00000000014210cf	leaq	-0x50(%rbp), %rbx
00000000014210d3	movq	%rbx, %rdi
00000000014210d6	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
00000000014210db	movq	%rbx, %rdi
00000000014210de	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
00000000014210e3	movq	%rbx, %rdi
00000000014210e6	movl	$0x1, %esi
00000000014210eb	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
00000000014210f0	movq	%rbx, %rdi
00000000014210f3	movl	$0x2, %esi
00000000014210f8	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
00000000014210fd	movq	%rbx, %rdi
0000000001421100	callq	__ZN9VlcParser2seEv             ## VlcParser::se()
0000000001421105	movq	%rbx, %rdi
0000000001421108	callq	__ZN9VlcParser2seEv             ## VlcParser::se()
000000000142110d	movq	%rbx, %rdi
0000000001421110	callq	__ZN9VlcParser2seEv             ## VlcParser::se()
0000000001421115	movq	%rbx, %rdi
0000000001421118	movl	$0x1, %esi
000000000142111d	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001421122	movq	%rbx, %rdi
0000000001421125	movl	$0x1, %esi
000000000142112a	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
000000000142112f	movq	%rbx, %rdi
0000000001421132	movl	$0x1, %esi
0000000001421137	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
000000000142113c	movq	%rbx, %rdi
000000000142113f	callq	__ZN9VlcParser15hasMoreRbspDataEv ## VlcParser::hasMoreRbspData()
0000000001421144	testb	%al, %al
0000000001421146	je	0x1421156
0000000001421148	leaq	-0x50(%rbp), %rdi
000000000142114c	movl	$0x1, %esi
0000000001421151	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001421156	addq	$0x38, %rsp
000000000142115a	popq	%rbx
000000000142115b	popq	%r14
000000000142115d	popq	%r15
000000000142115f	popq	%rbp
0000000001421160	retq
0000000001421161	nopw	%cs:(%rax,%rax)
